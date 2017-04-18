import { REQUEST_JKF, READ_JKF, MOVE_PIECE, GOTO_PATH, CHANGE_COMMENTS, MOVE_UP_FORK, MOVE_DOWN_FORK, REMOVE_FORK } from './actions';
import { jkfToKifuTree } from "./treeUtils";
import { buildJKFPlayerFromState } from './playerUtils';

const initialState = {
  baseJKF: { header: {}, moves: [{}] },
  kifuTree: jkfToKifuTree({ header: {}, moves: [{}] }),
  reversed: false,
  currentPathArray: [],
};

export default function kifuTree(state = initialState, action) {
  switch (action.type) {
    case REQUEST_JKF: {
      return Object.assign({}, state, { fetching: true });
    }
    case READ_JKF: {
      const jkf = action.jkf;
      const tree = jkfToKifuTree(jkf);

      return Object.assign({}, state, initialState, { kifuTree: tree, baseJKF: jkf });
    }
    case MOVE_PIECE: {
      const player = buildJKFPlayerFromState(state);
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

      return Object.assign({}, state, { kifuTree: tree, currentPathArray: currentPathArray });
    }
    case GOTO_PATH: {
      return Object.assign({}, state, { currentPathArray: action.pathArray });
    }
    case CHANGE_COMMENTS: {
      const pathArray = state.currentPathArray;
      const tree = state.kifuTree;
      const value = action.value;

      const { clonedTree, lastNode } = cloneTreeUntil(tree, pathArray);
      lastNode.comment = value;

      return Object.assign({}, state, { kifuTree: clonedTree });
    }
    case MOVE_UP_FORK: {
      const tree = state.kifuTree;
      const currentPathArray = state.currentPathArray;
      const pathArray = action.pathArray;

      const clonedTree = moveUpFork(tree, pathArray);
      if (clonedTree === tree) {
        return state;
      }
      const currentStringPathArray = getStringPathArray(tree, currentPathArray);
      const newPathArray = getPathArray(clonedTree, currentStringPathArray);

      return Object.assign({}, state, { kifuTree: clonedTree, currentPathArray: newPathArray });
    }
    case MOVE_DOWN_FORK: {
      const tree = state.kifuTree;
      const currentPathArray = state.currentPathArray;
      const pathArray = action.pathArray;

      const clonedTree = moveDownFork(tree, pathArray);
      if (clonedTree === tree) {
        return state;
      }
      const currentStringPathArray = getStringPathArray(tree, currentPathArray);
      const newPathArray = getPathArray(clonedTree, currentStringPathArray);

      return Object.assign({}, state, { kifuTree: clonedTree, currentPathArray: newPathArray });
    }
    case REMOVE_FORK: {
      const tree = state.kifuTree;
      const currentPathArray = state.currentPathArray;
      const pathArray = action.pathArray;

      const clonedTree = removeFork(tree, pathArray);

      const currentStringPathArray = getStringPathArray(tree, currentPathArray);
      const newPathArray = getPathArray(clonedTree, currentStringPathArray);

      return Object.assign({}, state, { kifuTree: clonedTree, currentPathArray: newPathArray });
    }
    default:
      return state;
  }
};

function moveUpFork(tree, pathArray) {
  if (pathArray.length === 0) {
    return tree; // do nothing
  }
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
  if (pathArray.length === 0) {
    return tree; // do nothing
  }
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
  if (pathArray.length === 0) {
    return tree; // do nothing
  }
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

function getStringPathArray(tree, pathArray) {
  const stringPathArray = [];
  let currentNode = tree;
  for (let index of pathArray) {
    const nextNode = currentNode.children[index];
    stringPathArray.push(nextNode.readableKifu);
    currentNode = nextNode;
  }

  return stringPathArray;
}

function getPathArray(tree, stringPathArray) {
  const pathArray = [];
  let currentNode = tree;
  for (let kifu of stringPathArray) {
    const nextNodeIndex = currentNode.children.findIndex(childNode => childNode.readableKifu === kifu);
    const nextNode = currentNode.children[nextNodeIndex];
    if (!nextNode) {
      break;  // stop if node is missing (e.g. node is removed)
    }
    pathArray.push(nextNodeIndex);
    currentNode = nextNode;
  }

  return pathArray;
}
