import { List } from 'immutable';

import {
  REQUEST_GET_JKF, RECEIVE_GET_JKF, REQUEST_PUT_JKF, RECEIVE_PUT_JKF,
  FAIL_PUT_JKF, CLEAR_MESSAGE, CHANGE_AUTO_SAVE,
  MOVE_PIECE, CHANGE_COMMENTS, CHANGE_REVERSED,
  GOTO_PATH, MOVE_UP_FORK, MOVE_DOWN_FORK, REMOVE_FORK
} from './actions';
import { jkfToKifuTree, kifuTreeToJKF, pathToKeyPath, getStringPath } from "./treeUtils";
import { buildJKFPlayerFromState } from './playerUtils';

const initialJKF = { header: {}, moves: [{}] };
const initialState = {
  jkf: initialJKF,
  kifuTree: jkfToKifuTree(initialJKF),
  reversed: false,
  currentPath: List(),
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
        const newPath = findCurrentPath(newKifuTree, player);
        return Object.assign({}, state, { kifuTree: newKifuTree, currentPath: newPath, jkf: newJKF, needSave: true });
      }

      const newPath = findCurrentPath(kifuTree, player);
      return Object.assign({}, state, { currentPath: newPath });
    }
    case GOTO_PATH: {
      return Object.assign({}, state, { currentPath: List(action.path) });
    }
    case CHANGE_COMMENTS: {
      const { kifuTree, currentPath, jkf } = state;
      const value = action.value;

      const currentKeyPath = pathToKeyPath(currentPath);
      const newKifuTree = kifuTree.setIn(currentKeyPath.concat(['comment']), value);
      const newJKF = kifuTreeToJKF(newKifuTree, jkf);

      return Object.assign({}, state, { kifuTree: newKifuTree, jkf: newJKF, needSave: true });
    }
    case CHANGE_REVERSED: {
      const value = action.value;
      return Object.assign({}, state, { reversed: value });
    }
    case MOVE_UP_FORK: {
      const path = action.path;

      return Object.assign({}, state, updateFork(state, path, (children, lastIndex) => {
        if (lastIndex === 0) {
          return children;
        }
        const prevNode = children.get(lastIndex - 1);
        return children.delete(lastIndex - 1).insert(lastIndex, prevNode);
      }));
    }
    case MOVE_DOWN_FORK: {
      const path = action.path;

      return Object.assign({}, state, updateFork(state, path, (children, lastIndex) => {
        if (lastIndex === children.size - 1) {
          return children;
        }
        const targetNode = children.get(lastIndex);
        return children.delete(lastIndex).insert(lastIndex + 1, targetNode);
      }));
    }
    case REMOVE_FORK: {
      const path = action.path;

      return Object.assign({}, state, updateFork(state, path, (children, lastIndex) => {
        return children.delete(lastIndex);
      }));
    }
    default:
      return state;
  }
};

function updateFork(state, path, forkUpdater) {
  const { kifuTree, currentPath, jkf } = state;
  const currentStringPath = getStringPath(kifuTree, currentPath);
  const newKifuTree = updateForkOfKifuTree(kifuTree, path, forkUpdater);
  if (newKifuTree === kifuTree) {
    return {}; // no change
  }
  const newJKF = kifuTreeToJKF(newKifuTree, jkf);
  const newPath = getPath(newKifuTree, currentStringPath);
  const needSave = newKifuTree !== kifuTree;

  return { kifuTree: newKifuTree, currentPath: newPath, jkf: newJKF, needSave: needSave };
}

function updateForkOfKifuTree(kifuTree, path, forkUpdater) {
  const lastIndex = path[path.length - 1];
  const parentKeyPath = pathToKeyPath(path.slice(0, -1));
  const newKifuTree = kifuTree.updateIn(parentKeyPath.concat(['children']), children => {
    return forkUpdater(children, lastIndex);
  });

  return newKifuTree;
}

// Find current path array from tree depending on the state of player
function findCurrentPath(tree, player, stopIfMissing = false) {
  const path = [];
  let currentNode = tree;
  for (let state of player.getReadableKifuState().slice(1, player.tesuu + 1)) {
    const nextNodeIndex = currentNode.children.findIndex(childNode => childNode.readableKifu === state.kifu);
    const nextNode = currentNode.children.get(nextNodeIndex);
    if (!nextNode) {
      if (stopIfMissing) {
        break;
      } else {
        throw new Error("Active node not found");
      }
    }

    path.push(nextNodeIndex);
    currentNode = nextNode;
  }
  return List(path);
}

function getPath(tree, stringPath) {
  const path = [];
  let currentNode = tree;
  for (let kifu of stringPath) {
    const nextNodeIndex = currentNode.children.findIndex(childNode => childNode.readableKifu === kifu);
    if (nextNodeIndex < 0) {
      break;  // stop if node is missing (e.g. node is removed)
    }
    const nextNode = currentNode.children.get(nextNodeIndex);

    path.push(nextNodeIndex);
    currentNode = nextNode;
  }

  return List(path);
}
