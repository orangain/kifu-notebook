import {
  REQUEST_GET_JKF, RECEIVE_GET_JKF, REQUEST_PUT_JKF, RECEIVE_PUT_JKF,
  FAIL_PUT_JKF, CLEAR_MESSAGE, CHANGE_AUTO_SAVE,
  MOVE_PIECE, CHANGE_COMMENTS, CHANGE_REVERSED,
  GOTO_PATH, MOVE_UP_FORK, MOVE_DOWN_FORK, REMOVE_FORK
} from './actions';
import { jkfToKifuTree, kifuTreeToJKF, pathArrayToKeyPath, findNodeByPath, getStringPathArray } from "./treeUtils";
import { buildJKFPlayerFromState } from './playerUtils';

const initialJKF = { header: {}, moves: [{}] };
const initialState = {
  jkf: initialJKF,
  kifuTree: jkfToKifuTree(initialJKF),
  reversed: false,
  currentPathArray: [],
  message: "",
  autoSaveEnabled: false,
  needSave: false,
};

export default function kifuTree(state = initialState, action) {
  switch (action.type) {
    case REQUEST_GET_JKF: {
      return Object.assign({}, state, { message: "Fetching..." });
    }
    case RECEIVE_GET_JKF: {
      const jkf = action.jkf;
      const tree = jkfToKifuTree(jkf);

      return Object.assign({}, state, initialState, { kifuTree: tree, jkf: jkf, message: "Fetched" });
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
      if (!move.to) {
        return state; // drop to mochigoma
      }
      if (move.from && move.from.x === move.to.x && move.from.y === move.to.y) {
        return state; // drop to the same place. do nothing
      }
      move.to = { x: move.to.x, y: move.to.y }; // In some environment, move.to contains dropEffect attribute. Get rid of it.

      const originalJKFString = JSON.stringify(jkf);

      try {
        if (!player.inputMove(move)) {
          move.promote = confirm("成りますか？");
          player.inputMove(move);
        }
      } catch (e) {
        alert(e);
        return state;
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
    case CHANGE_COMMENTS: {
      const { kifuTree, currentPathArray, jkf } = state;
      const value = action.value;

      const currentKeyPath = pathArrayToKeyPath(currentPathArray);
      const newKifuTree = kifuTree.setIn(currentKeyPath.concat(['comment']), value);
      const newJKF = kifuTreeToJKF(newKifuTree, jkf);

      return Object.assign({}, state, { kifuTree: newKifuTree, jkf: newJKF, needSave: true });
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

      const currentStringPathArray = getStringPathArray(kifuTree, currentPathArray);
      const newKifuTree = removeFork(kifuTree, pathArray);
      const newJKF = kifuTreeToJKF(newKifuTree, jkf);
      const newPathArray = getPathArray(newKifuTree, currentStringPathArray);

      return Object.assign({}, state, { kifuTree: newKifuTree, currentPathArray: newPathArray, jkf: newJKF, needSave: true });
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

function removeFork(kifuTree, pathArray) {
  const lastIndex = pathArray[pathArray.length - 1];
  const parentKeyPath = pathArrayToKeyPath(pathArray.slice(0, -1));
  const newKifuTree = kifuTree.updateIn(parentKeyPath.concat(['children']), children => {
    return children.delete(lastIndex);
  });

  return newKifuTree;
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

function getPathArray(tree, stringPathArray) {
  const pathArray = [];
  let currentNode = tree;
  for (let kifu of stringPathArray) {
    const nextNodeIndex = currentNode.children.findIndex(childNode => childNode.readableKifu === kifu);
    if (nextNodeIndex < 0) {
      break;  // stop if node is missing (e.g. node is removed)
    }
    const nextNode = currentNode.children.get(nextNodeIndex);

    pathArray.push(nextNodeIndex);
    currentNode = nextNode;
  }

  return pathArray;
}
