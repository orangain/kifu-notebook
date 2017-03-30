import JKFPlayer from "json-kifu-format";

export function jkfToKifuTree(jkf) {
  const moveFormatsToForks = (moveFormats) => {
    let forks = [];
    if (moveFormats.length >= 2) {
      forks.push(moveFormats.slice(1));
    }

    if (moveFormats[1] && moveFormats[1].forks) {
      forks = forks.concat(moveFormats[1].forks);
    }
    return forks;
  };

  const createKifuTreeNode = (tesuu, moveFormats, path) => {
    const moveFormat = moveFormats[0];
    //console.log(tesuu, moveFormats);
    return {
      tesuu: tesuu,
      comment: moveFormat.comments ? moveFormat.comments.join('\n') : undefined,
      move: moveFormat.move,
      time: moveFormat.time,
      special: moveFormat.special,
      readableKifu: tesuu === 0 ? '開始局面' : JKFPlayer.moveToReadableKifu(moveFormat),
      children: moveFormatsToForks(moveFormats).map((moveFormatsOfFork, i) => createKifuTreeNode(tesuu + 1, moveFormatsOfFork, path.concat([i]))),
    };
  };

  return createKifuTreeNode(0, jkf.moves, []);
};

export function kifuTreeToJKF(kifuTree, baseJKF) {
  const nodesToMoveFormats = (nodes) => {
    const primaryNode = nodes[0];

    if (!primaryNode) {
      return [];
    }

    // key order is important for readability
    const primaryMoveFormat = {
      comments: primaryNode.comment ? primaryNode.comment.split('\n') : undefined,
      move: primaryNode.move,
      time: primaryNode.time,
      special: primaryNode.special,
      forks: nodes.length >= 2 ? nodes.slice(1).map(childNode => nodesToMoveFormats([childNode]))
        : undefined,
    };

    return [primaryMoveFormat].concat(nodesToMoveFormats(primaryNode.children));
  };

  // key order is important for readability
  const newJKF = {
    header: baseJKF.header,
    initial: baseJKF.initial,
    moves: [baseJKF.moves[0]].concat(nodesToMoveFormats(kifuTree.children)),
  };
  return newJKF;
};

export const LOAD_JKF = 'LOAD_JKF';
export const GOTO_PATH = 'GOTO_PATH';
export const MOVE_UP_FORK = 'MOVE_UP_FORK';
export const MOVE_DOWN_FORK = 'MOVE_DOWN_FORK';
export const REMOVE_FORK = 'REMOVE_FORK';

const initialState = {
  player: new JKFPlayer({ header: {}, moves: [{}] }),
  reversed: false,
  currentPath: '[]',
};

export function kifuTree(state, action) {
  if (!state) {
    return initialState;
  }

  switch (action.type) {
    case LOAD_JKF: {
      const jkf = action.jkf;

      const newPlayer = new JKFPlayer(jkf);
      const tree = jkfToKifuTree(jkf);

      return Object.assign({}, state, initialState, { kifuTree: tree, player: newPlayer });
    }
    case GOTO_PATH: {
      const tree = state.kifuTree;
      const pathArray = JSON.parse(action.path);

      const newPlayer = new JKFPlayer(state.player.kifu);
      gotoPath(newPlayer, pathArray);

      const currentPathArray = findCurrentPathArray(tree, newPlayer);
      return Object.assign({}, state, { player: newPlayer, currentPath: JSON.stringify(currentPathArray) });
    }
    case MOVE_UP_FORK: {
      const player = state.player;
      const tree = state.kifuTree;
      const pathArray = JSON.parse(action.path);

      const clonedTree = moveUpFork(tree, pathArray);
      if (clonedTree === tree) {
        return state;
      }
      const currentPathArray = findCurrentPathArray(clonedTree, player);
      const newPlayer = new JKFPlayer(kifuTreeToJKF(clonedTree, player.kifu));
      gotoPath(newPlayer, currentPathArray);

      return Object.assign({}, state, { kifuTree: clonedTree, player: newPlayer, currentPath: JSON.stringify(currentPathArray) });
    }
    case MOVE_DOWN_FORK: {
      const player = state.player;
      const tree = state.kifuTree;
      const pathArray = JSON.parse(action.path);

      const clonedTree = moveDownFork(tree, pathArray);
      if (clonedTree === tree) {
        return state;
      }
      const currentPathArray = findCurrentPathArray(clonedTree, player);
      const newPlayer = new JKFPlayer(kifuTreeToJKF(clonedTree, player.kifu));
      gotoPath(newPlayer, currentPathArray);

      return Object.assign({}, state, { kifuTree: clonedTree, player: newPlayer, currentPath: JSON.stringify(currentPathArray) });
    }
    case REMOVE_FORK: {
      const player = state.player;
      const tree = state.kifuTree;
      const pathArray = JSON.parse(action.path);

      const clonedTree = removeFork(tree, pathArray);
      const currentPathArray = findCurrentPathArray(clonedTree, player, true); // stop if node is missing
      const newPlayer = new JKFPlayer(kifuTreeToJKF(clonedTree, player.kifu));
      gotoPath(newPlayer, currentPathArray);

      return Object.assign({}, state, { kifuTree: clonedTree, player: newPlayer, currentPath: JSON.stringify(currentPathArray) });
    }
    default:
      return state;
  }
};

function gotoPath(player, pathArray) {
  pathArray.forEach(num => {
    if (num === 0) {
      player.forward();
    } else {
      player.forkAndForward(num - 1);
    }
  });
}

function moveUpFork(tree, pathArray) {
  const lastNum = pathArray[pathArray.length - 1];
  const pathArrayOfParent = pathArray.slice(0, pathArray.length - 1);
  if (lastNum === 0) {
    return tree; // do nothing
  }

  const { clonedTree, lastNode } = cloneTreeUntil(tree, pathArrayOfParent);

  lastNode.children = [
    ...lastNode.children.slice(0, lastNum - 1),
    lastNode.children[lastNum],
    lastNode.children[lastNum - 1],
    ...lastNode.children.slice(lastNum + 1),
  ];

  return clonedTree;
}

function moveDownFork(tree, pathArray) {
  const lastNum = pathArray[pathArray.length - 1];
  const pathArrayOfParent = pathArray.slice(0, pathArray.length - 1);
  if (lastNum === findNodeByPath(tree, pathArrayOfParent).children.length - 1) {
    return tree; // do nothing
  }

  const { clonedTree, lastNode } = cloneTreeUntil(tree, pathArrayOfParent);

  lastNode.children = [
    ...lastNode.children.slice(0, lastNum),
    lastNode.children[lastNum + 1],
    lastNode.children[lastNum],
    ...lastNode.children.slice(lastNum + 2),
  ];

  return clonedTree;
}

function removeFork(tree, pathArray) {
  const lastNum = pathArray[pathArray.length - 1];
  const pathArrayOfParent = pathArray.slice(0, pathArray.length - 1);

  const { clonedTree, lastNode } = cloneTreeUntil(tree, pathArrayOfParent);

  lastNode.children = [
    ...lastNode.children.slice(0, lastNum),
    ...lastNode.children.slice(lastNum + 1),
  ];

  return clonedTree;
}

function cloneTreeUntil(tree, pathArray) {
  const clonedTree = Object.assign({}, tree);

  let currentNode = clonedTree;
  pathArray.forEach(num => {
    const childNode = Object.assign({}, currentNode.children[num]);
    currentNode.children = [
      ...currentNode.children.slice(0, num),
      childNode,
      ...currentNode.children.slice(num + 1),
    ];

    currentNode = childNode;
  });

  return { clonedTree: clonedTree, lastNode: currentNode };
}

// Find current path array from tree depending on the state of player
function findCurrentPathArray(tree, player, stopIfMissing = false) {
  const pathArray = [];
  let currentNode = tree;
  for (let state of player.getReadableKifuState().slice(1, player.tesuu + 1)) {
    const nextNodeIndex = currentNode.children.findIndex(childNode => childNode.readableKifu === state.kifu);
    const nextNode = currentNode.children[nextNodeIndex];
    if (!nextNode) {
      if (stopIfMissing) {
        break;
      } else {
        throw new Error("Active node not found");
      }
    }

    pathArray.push(nextNodeIndex);
    currentNode = nextNode;
  }
  return pathArray;
}

function findNodeByPath(tree, pathArray) {
  let currentNode = tree;
  pathArray.forEach(num => {
    currentNode = currentNode.children[num];
  });

  return currentNode;
}
