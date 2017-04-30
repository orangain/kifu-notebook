import { List } from 'immutable';
import JKFPlayer from 'json-kifu-format';

import {
  REQUEST_GET_JKF, RECEIVE_GET_JKF, REQUEST_PUT_JKF, RECEIVE_PUT_JKF,
  FAIL_PUT_JKF, CLEAR_MESSAGE, CHANGE_AUTO_SAVE,
  MOVE_PIECE, CHANGE_COMMENTS, CHANGE_REVERSED,
  GOTO_PATH, MOVE_UP_FORK, MOVE_DOWN_FORK, REMOVE_FORK
} from './actions';
import {
  jkfToKifuTree, createKifuTreeNode, kifuTreeToJKF, pathToKeyPath,
  getStringPath, findNodeByPath, getNodesOnPath
} from "./treeUtils";

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
      const { kifuTree, currentPath, jkf } = state;
      const move = action.move;

      const changedState = movePiece({ kifuTree, currentPath, jkf }, move);
      if (changedState.kifuTree && changedState.kifuTree !== kifuTree) {
        const newJKF = kifuTreeToJKF(changedState.kifuTree, jkf);
        changedState.jkf = newJKF;
        changedState.needSave = true;
      }
      return Object.assign({}, state, changedState);
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

function movePiece(state, move) {
  const { kifuTree, currentPath, jkf } = state;

  // 1. Check and normalize move
  if (!move.to) {
    return {}; // drop to mochigoma
  }
  if (move.from && move.from.x === move.to.x && move.from.y === move.to.y) {
    return {}; // drop to the same place. do nothing
  }
  move.to = { x: move.to.x, y: move.to.y }; // In some environment, move.to contains dropEffect attribute. Get rid of it.

  // 2. Compare with existing nodes
  const currentNode = findNodeByPath(kifuTree, currentPath);
  const childIndex = currentNode.children.findIndex(childNode => JKFPlayer.sameMoveMinimal(childNode.move, move));
  if (childIndex >= 0) {
    return { currentPath: currentPath.push(childIndex) };
  }

  // 3. Make player then input move
  const minimalMoveFormats = [{}].concat(getNodesOnPath(kifuTree, currentPath).map(node => ({ move: node.move })));
  const minimalJKF = Object.assign({}, jkf, { moves: minimalMoveFormats });
  const player = new JKFPlayer(minimalJKF);
  player.goto(minimalMoveFormats.length);

  try {
    if (!player.inputMove(move)) {
      move.promote = confirm("成りますか？");
      player.inputMove(move);
    }
  } catch (e) {
    alert(e);
    return {};
  }

  // 4. Create new objects
  const newMoveFormat = player.kifu.moves[player.kifu.moves.length - 1]; // newMoveFormat is normalized
  const newNode = createKifuTreeNode(player.shogi, currentNode.tesuu + 1, [newMoveFormat]);
  const newKifuTree = kifuTree.updateIn(pathToKeyPath(currentPath).concat(['children']), children => {
    return children.push(newNode);
  })
  const newCurrentPath = currentPath.push(currentNode.children.size);

  return { kifuTree: newKifuTree, currentPath: newCurrentPath };
}

function updateFork(state, path, forkUpdater) {
  const { kifuTree, currentPath, jkf } = state;
  const currentStringPath = getStringPath(kifuTree, currentPath);
  const newKifuTree = updateForkOfKifuTree(kifuTree, path, forkUpdater);
  if (newKifuTree === kifuTree) {
    return {}; // no change
  }
  const newJKF = kifuTreeToJKF(newKifuTree, jkf);
  const newPath = getPathFromStringPath(newKifuTree, currentStringPath);
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

function getPathFromStringPath(tree, stringPath) {
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
