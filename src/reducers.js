import {
  REQUEST_GET_JKF, RECEIVE_GET_JKF, REQUEST_PUT_JKF, RECEIVE_PUT_JKF,
  FAIL_PUT_JKF, CLEAR_MESSAGE, CHANGE_AUTO_SAVE,
  MOVE_PIECE, CHANGE_COMMENTS, CHANGE_REVERSED,
  GOTO_PATH, GO_BACK, GO_FORWARD, MOVE_UP_FORK, MOVE_DOWN_FORK, REMOVE_FORK
} from './actions';
import { jkfToKifuTree, kifuTreeToJKF } from "./treeUtils";
import { buildJKFPlayerFromState } from './playerUtils';

const initialJKF = { header: {}, moves: [{}] };
const initialState = {
  jkf: initialJKF,
  kifuTree: jkfToKifuTree(initialJKF),
  reversed: false,
  currentPathArray: [],
  fetching: false,
  autoSaveEnabled: false,
  needSave: false,
};

export default function kifuTree(state = initialState, action) {
  switch (action.type) {
    case REQUEST_GET_JKF: {
      return Object.assign({}, state, { fetching: true });
    }
    case RECEIVE_GET_JKF: {
      const jkf = action.jkf;
      const tree = jkfToKifuTree(jkf);

      return Object.assign({}, state, initialState, { kifuTree: tree, jkf: jkf, fetching: false });
    }
    case REQUEST_PUT_JKF: {
      return Object.assign({}, state, { message: "Saving...", needSave: false });
    }
    case RECEIVE_PUT_JKF: {
      return Object.assign({}, state, { message: "Saved" });
    }
    case FAIL_PUT_JKF: {
      return Object.assign({}, state, { message: "Failed" });
    }
    case CLEAR_MESSAGE: {
      return Object.assign({}, state, { message: "" });
    }
    case CHANGE_AUTO_SAVE: {
      const enabled = action.enabled;
      return Object.assign({}, state, { autoSaveEnabled: enabled });
    }
    case MOVE_PIECE: {
      const player = buildJKFPlayerFromState(state);
      const { jkf, kifuTree } = state;
      const move = action.move;
      const originalJKFString = JSON.stringify(jkf);

      try {
        if (!player.inputMove(move)) {
          move.promote = confirm("成りますか？");
          player.inputMove(move);
        }
      } catch (e) {
        alert(e);
      }

      const newJKF = player.kifu;
      const newJKFString = JSON.stringify(newJKF);
      const changed = originalJKFString !== newJKFString;
      //console.log(changed);

      if (changed) {
        const newKifuTree = jkfToKifuTree(newJKF);
        const newPathArray = findCurrentPathArray(newKifuTree, player);
        return Object.assign({}, state, { kifuTree: newKifuTree, currentPathArray: newPathArray, jkf: newJKF, needSave: true });
      }

      const newPathArray = findCurrentPathArray(kifuTree, player);
      return Object.assign({}, state, { currentPathArray: newPathArray });
    }
    case GOTO_PATH: {
      return Object.assign({}, state, { currentPathArray: action.pathArray });
    }
    case GO_BACK: {
      const { currentPathArray } = state;
      if (currentPathArray.length === 0) {
        return state;
      }
      const newPathArray = currentPathArray.slice(0, -1);
      return Object.assign({}, state, { currentPathArray: newPathArray });
    }
    case GO_FORWARD: {
      const { kifuTree, currentPathArray } = state;
      const currentNode = findNodeByPath(kifuTree, currentPathArray);
      if (currentNode.children.length === 0) {
        return state;
      }
      const newPathArray = [...currentPathArray, 0];
      return Object.assign({}, state, { currentPathArray: newPathArray });
    }
    case CHANGE_COMMENTS: {
      const { kifuTree, currentPathArray, jkf } = state;
      const value = action.value;

      const { clonedTree, lastNode } = cloneTreeUntil(kifuTree, currentPathArray);
      lastNode.comment = value;
      const newJKF = kifuTreeToJKF(clonedTree, jkf);

      return Object.assign({}, state, { kifuTree: clonedTree, jkf: newJKF, needSave: true });
    }
    case CHANGE_REVERSED: {
      const value = action.value;
      return Object.assign({}, state, { reversed: value });
    }
    case MOVE_UP_FORK: {
      const { kifuTree, currentPathArray, jkf } = state;
      const pathArray = action.pathArray;

      const clonedTree = moveUpFork(kifuTree, pathArray);
      if (clonedTree === kifuTree) {
        return state;
      }
      const currentStringPathArray = getStringPathArray(kifuTree, currentPathArray);
      const newPathArray = getPathArray(clonedTree, currentStringPathArray);
      const newJKF = kifuTreeToJKF(clonedTree, jkf);

      return Object.assign({}, state, { kifuTree: clonedTree, currentPathArray: newPathArray, jkf: newJKF, needSave: true });
    }
    case MOVE_DOWN_FORK: {
      const { kifuTree, currentPathArray, jkf } = state;
      const pathArray = action.pathArray;

      const clonedTree = moveDownFork(kifuTree, pathArray);
      if (clonedTree === kifuTree) {
        return state;
      }
      const currentStringPathArray = getStringPathArray(kifuTree, currentPathArray);
      const newPathArray = getPathArray(clonedTree, currentStringPathArray);
      const newJKF = kifuTreeToJKF(clonedTree, jkf);

      return Object.assign({}, state, { kifuTree: clonedTree, currentPathArray: newPathArray, jkf: newJKF, needSave: true });
    }
    case REMOVE_FORK: {
      const { kifuTree, currentPathArray, jkf } = state;
      const pathArray = action.pathArray;

      const clonedTree = removeFork(kifuTree, pathArray);

      const currentStringPathArray = getStringPathArray(kifuTree, currentPathArray);
      const newPathArray = getPathArray(clonedTree, currentStringPathArray);
      const newJKF = kifuTreeToJKF(clonedTree, jkf);

      return Object.assign({}, state, { kifuTree: clonedTree, currentPathArray: newPathArray, jkf: newJKF, needSave: true });
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
