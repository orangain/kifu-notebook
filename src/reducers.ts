import { List } from 'immutable';
import { JKFPlayer, MoveMoveFormat } from './shogiUtils';

import {
  REQUEST_GET_JKF, RECEIVE_GET_JKF, REQUEST_PUT_JKF, RECEIVE_PUT_JKF,
  FAIL_PUT_JKF, CLEAR_MESSAGE, CHANGE_AUTO_SAVE,
  MOVE_PIECE, CHANGE_COMMENTS, CHANGE_REVERSED,
  GOTO_PATH, MOVE_UP_FORK, MOVE_DOWN_FORK, REMOVE_FORK
} from './actions';
import { KifuTreeNode, Path, createKifuTreeNode, getStringPath } from "./treeUtils";
import { KifuNotebookState, KifuTree } from "./models";

const initialState: KifuNotebookState = {
  kifuTree: KifuTree.fromJKF({ header: {}, moves: [{}] }),
  reversed: false,
  message: "",
  autoSaveEnabled: false,
  needSave: false,
};

export default function kifuTree(state: KifuNotebookState = initialState, action: any): Partial<KifuNotebookState> {
  switch (action.type) {
    case REQUEST_GET_JKF: {
      return Object.assign({}, state, { message: "Fetching..." });
    }
    case RECEIVE_GET_JKF: {
      const jkf = action.jkf;
      const kifuTree = KifuTree.fromJKF(jkf);

      return Object.assign({}, state, initialState, { kifuTree: kifuTree, message: "Fetched" });
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
      const { kifuTree } = state;
      const move = action.move;

      return Object.assign({}, state, movePiece(kifuTree, move));
    }
    case GOTO_PATH: {
      const { kifuTree } = state;
      const path = action.path;

      return Object.assign({}, state, { kifuTree: kifuTree.setCurrentPath(path) });
    }
    case CHANGE_COMMENTS: {
      const { kifuTree } = state;
      const value = action.value;

      const newKifuTree = kifuTree.updateNode(kifuTree.currentPath, (node: KifuTreeNode) => {
        return node.set('comment', value);
      });
      return Object.assign({}, state, { kifuTree: newKifuTree, needSave: true });
    }
    case CHANGE_REVERSED: {
      const value = action.value;
      return Object.assign({}, state, { reversed: value });
    }
    case MOVE_UP_FORK: {
      const { kifuTree } = state;
      const path = action.path;

      return Object.assign({}, state, updateFork(kifuTree, path, (children, lastIndex) => {
        if (lastIndex === 0) {
          return children;
        }
        const prevNode = children.get(lastIndex - 1);
        return children.delete(lastIndex - 1).insert(lastIndex, prevNode);
      }));
    }
    case MOVE_DOWN_FORK: {
      const { kifuTree } = state;
      const path = action.path;

      return Object.assign({}, state, updateFork(kifuTree, path, (children, lastIndex) => {
        if (lastIndex === children.size - 1) {
          return children;
        }
        const targetNode = children.get(lastIndex);
        return children.delete(lastIndex).insert(lastIndex + 1, targetNode);
      }));
    }
    case REMOVE_FORK: {
      const { kifuTree } = state;
      const path = action.path;

      return Object.assign({}, state, updateFork(kifuTree, path, (children, lastIndex) => {
        return children.delete(lastIndex);
      }));
    }
    default:
      return state;
  }
};

function movePiece(kifuTree: KifuTree, move: MoveMoveFormat): Partial<KifuNotebookState> {
  // 1. Check and normalize move
  if (!move.to) {
    return {}; // drop to mochigoma
  }
  if (move.from && move.from.x === move.to.x && move.from.y === move.to.y) {
    return {}; // drop to the same place. do nothing
  }
  move.to = { x: move.to.x, y: move.to.y }; // In some environment, move.to contains dropEffect attribute. Get rid of it.

  // 2. Compare with existing nodes
  const currentNode = kifuTree.getCurrentNode();
  const childIndex = currentNode.children.findIndex((childNode: KifuTreeNode): boolean => JKFPlayer.sameMoveMinimal(childNode.move, move));
  if (childIndex >= 0) {
    return { kifuTree: kifuTree.setCurrentPath(kifuTree.currentPath.concat([childIndex])) }; // Proceed to existing node
  }

  // 3. Make player then input move
  const minimalMoveFormats = [{}].concat(kifuTree.getNodesOnPath(kifuTree.currentPath).map(node => ({ move: node.move })));
  const minimalJKF = Object.assign({}, kifuTree.baseJKF, { moves: minimalMoveFormats });
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
  const newKifuTree = kifuTree
    .updateNode(kifuTree.currentPath, (node: KifuTreeNode) => {
      return node.update('children', children => {
        return children.push(newNode);
      });
    })
    .setCurrentPath(kifuTree.currentPath.concat([currentNode.children.size]));

  return { kifuTree: newKifuTree, needSave: true };
}

function updateFork(kifuTree: KifuTree, path: Path, forkUpdater: (children: List<KifuTreeNode>, lastIndex: number) => List<KifuTreeNode>): Partial<KifuNotebookState> {
  const currentStringPath = getStringPath(kifuTree.rootNode, kifuTree.currentPath);
  let newKifuTree = updateForkOfKifuTree(kifuTree, path, forkUpdater);
  if (newKifuTree === kifuTree) {
    return {}; // no change
  }

  const newPath = getPathFromStringPath(newKifuTree.rootNode, currentStringPath);
  newKifuTree = newKifuTree.setCurrentPath(newPath);

  return { kifuTree: newKifuTree, needSave: true };
}

function updateForkOfKifuTree(kifuTree: KifuTree, path: Path, forkUpdater: (children: List<KifuTreeNode>, lastIndex: number) => List<KifuTreeNode>): KifuTree {
  const lastIndex = path.get(path.size - 1);
  const parentPath = path.slice(0, -1);
  const newKifuTree = kifuTree.updateNode(parentPath, (node: KifuTreeNode) => {
    return node.update('children', (children: List<KifuTreeNode>) => {
      return forkUpdater(children, lastIndex);
    });
  });

  return newKifuTree;
}

function getPathFromStringPath(tree: KifuTreeNode, stringPath: string[]): Path {
  const path: number[] = [];
  let currentNode = tree;
  for (let kifu of stringPath) {
    const nextNodeIndex = currentNode.children.findIndex((childNode: KifuTreeNode): boolean => childNode.readableKifu === kifu);
    if (nextNodeIndex < 0) {
      break;  // stop if node is missing (e.g. node is removed)
    }
    const nextNode = currentNode.children.get(nextNodeIndex);

    path.push(nextNodeIndex);
    currentNode = nextNode;
  }

  return List(path);
}
