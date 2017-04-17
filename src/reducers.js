import JKFPlayer from "json-kifu-format";

import { REQUEST_JKF, READ_JKF, MOVE_PIECE, GOTO_PATH, CHANGE_COMMENTS, MOVE_UP_FORK, MOVE_DOWN_FORK, REMOVE_FORK } from './actions';
import { jkfToKifuTree, kifuTreeToJKF } from "./treeUtils";

const initialState = {
  player: new JKFPlayer({ header: {}, moves: [{}] }),
  reversed: false,
  currentPath: JSON.stringify([]),
};

export default function kifuTree(state = initialState, action) {
  switch (action.type) {
    case REQUEST_JKF: {
      return Object.assign({}, state, { fetching: true });
    }
    case READ_JKF: {
      const jkf = action.jkf;

      const newPlayer = new JKFPlayer(jkf);
      const tree = jkfToKifuTree(newPlayer.kifu);

      return Object.assign({}, state, initialState, { kifuTree: tree, player: newPlayer });
    }
    case MOVE_PIECE: {
      const player = state.player;
      const move = action.move;

      try {
        if (!player.inputMove(move)) {
          move.promote = confirm("成りますか？");
          player.inputMove(move);
        }
      } catch (e) {
        // ignore
      }

      const tree = jkfToKifuTree(player.kifu);
      const currentPathArray = findCurrentPathArray(tree, player);

      return Object.assign({}, state, { kifuTree: tree, player: player, currentPath: JSON.stringify(currentPathArray) });
    }
    case GOTO_PATH: {
      const tree = state.kifuTree;
      const pathArray = JSON.parse(action.path);

      const newPlayer = new JKFPlayer(state.player.kifu);
      gotoPath(newPlayer, pathArray);

      const currentPathArray = findCurrentPathArray(tree, newPlayer);
      return Object.assign({}, state, { player: newPlayer, currentPath: JSON.stringify(currentPathArray) });
    }
    case CHANGE_COMMENTS: {
      const player = state.player;
      const tree = state.kifuTree;
      const pathArray = findCurrentPathArray(tree, player);
      const value = action.value;

      const { clonedTree, lastNode } = cloneTreeUntil(tree, pathArray);
      lastNode.comment = value;
      const newPlayer = new JKFPlayer(kifuTreeToJKF(clonedTree, player.kifu));
      gotoPath(newPlayer, pathArray);

      return Object.assign({}, state, { kifuTree: clonedTree, player: newPlayer });
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
