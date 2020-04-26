import { List } from "immutable";
import { IMoveMoveFormat } from "json-kifu-format/dist/src/Formats";

import {
  REQUEST_GET_JKF,
  RECEIVE_GET_JKF,
  REQUEST_PUT_JKF,
  RECEIVE_PUT_JKF,
  FAIL_PUT_JKF,
  CLEAR_MESSAGE,
  CHANGE_AUTO_SAVE,
  MOVE_PIECE,
  CHANGE_COMMENTS,
  UPDATE_COMMENTS,
  GOTO_PATH,
  MOVE_UP_FORK,
  MOVE_DOWN_FORK,
  REMOVE_FORK,
} from "./actions";
import { KifuNotebookState, KifuTree, KifuTreeNode, Path } from "./models";

const initialState: KifuNotebookState = {
  kifuTree: KifuTree.fromJKF({ header: {}, moves: [{}] }),
  message: "",
  autoSaveEnabled: false,
  needSave: false,
};

export default function kifuNotebookReducer(
  state: KifuNotebookState = initialState,
  action: any
): KifuNotebookState {
  switch (action.type) {
    case REQUEST_GET_JKF: {
      return Object.assign({}, state, { message: "Fetching..." });
    }
    case RECEIVE_GET_JKF: {
      const jkf = action.jkf;
      const kifuTree = KifuTree.fromJKF(jkf);

      return Object.assign({}, state, initialState, {
        kifuTree: kifuTree,
        message: "Fetched",
      });
    }
    case REQUEST_PUT_JKF: {
      return Object.assign({}, state, {
        message: "Saving...",
        needSave: false,
      });
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
      const { kifuTree } = state;
      const move = action.move;

      return Object.assign({}, state, movePiece(kifuTree, move));
    }
    case GOTO_PATH: {
      const { kifuTree } = state;
      const path = action.path;

      return Object.assign({}, state, {
        kifuTree: kifuTree.setCurrentPath(path),
      });
    }
    case CHANGE_COMMENTS: {
      const { kifuTree } = state;
      const value = action.value;

      const newKifuTree = kifuTree.updateNode(
        kifuTree.currentPath,
        (node: KifuTreeNode) => {
          return node.set("comment", value);
        },
        true
      );
      return { ...state, kifuTree: newKifuTree };
    }
    case UPDATE_COMMENTS: {
      return { ...state, needSave: true };
    }
    case MOVE_UP_FORK: {
      const { kifuTree } = state;
      const path = action.path;

      return Object.assign(
        {},
        state,
        updateFork(kifuTree, path, (children, lastIndex) => {
          if (lastIndex === 0) {
            return children;
          }
          const prevNode = children.get(lastIndex - 1);
          return children.delete(lastIndex - 1).insert(lastIndex, prevNode);
        })
      );
    }
    case MOVE_DOWN_FORK: {
      const { kifuTree } = state;
      const path = action.path;

      return Object.assign(
        {},
        state,
        updateFork(kifuTree, path, (children, lastIndex) => {
          if (lastIndex === children.size - 1) {
            return children;
          }
          const targetNode = children.get(lastIndex);
          return children.delete(lastIndex).insert(lastIndex + 1, targetNode);
        })
      );
    }
    case REMOVE_FORK: {
      const { kifuTree } = state;
      const path = action.path;

      return Object.assign(
        {},
        state,
        updateFork(kifuTree, path, (children, lastIndex) => {
          return children.delete(lastIndex);
        })
      );
    }
    default:
      return state;
  }
}

function movePiece(kifuTree: KifuTree, move: IMoveMoveFormat): Partial<KifuNotebookState> {
  // 1. Check and normalize move
  if (!move.to) {
    return {}; // drop to mochigoma
  }
  if (move.from && move.from.x === move.to.x && move.from.y === move.to.y) {
    return {}; // drop to the same place. do nothing
  }
  move.to = { x: move.to.x, y: move.to.y }; // In some environment, move.to contains dropEffect attribute. Get rid of it.

  // 2. do move piece
  let newKifuTree: KifuTree | false;
  try {
    newKifuTree = kifuTree.movePiece(move);
    if (newKifuTree === false) {
      move.promote = window.confirm("成りますか？");
      newKifuTree = kifuTree.movePiece(move) as KifuTree;
    }
  } catch (e) {
    alert(e);
    return {};
  }

  // When save is not needed, needSave must be undefined, not false.
  // needSave is changed to false only when save is done.
  const needSave = newKifuTree.rootNode !== kifuTree.rootNode ? true : undefined;

  return { kifuTree: newKifuTree, needSave: needSave };
}

function updateFork(
  kifuTree: KifuTree,
  path: Path,
  forkUpdater: (children: List<KifuTreeNode>, lastIndex: number) => List<KifuTreeNode>
): Partial<KifuNotebookState> {
  const newKifuTree = kifuTree.updateFork(path, forkUpdater);
  if (newKifuTree === kifuTree) {
    return {}; // no change
  }

  return { kifuTree: newKifuTree, needSave: true };
}
