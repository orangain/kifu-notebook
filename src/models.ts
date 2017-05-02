import { Record, Map, List } from 'immutable';
import { KifuTreeNode, Path, JumpMap, JumpTo, jkfToKifuTree, kifuTreeToJKF, pathToKeyPath, findNodeByPath, getNodesOnPath, getStringPath, getPathFromStringPath, createKifuTreeNode } from "./treeUtils";
import { JSONKifuFormat, MoveMoveFormat, JKFPlayer } from "./shogiUtils";

export { KifuTreeNode, Path, JumpMap, JumpTo }; // for convenience

export class KifuTree extends Record({
  rootNode: null,
  baseJKF: null,
  currentPath: List<number>(),
}) {
  readonly rootNode: KifuTreeNode;
  readonly baseJKF: JSONKifuFormat;
  readonly currentPath: Path;

  static fromJKF(jkf: JSONKifuFormat): KifuTree {
    const rootNode = jkfToKifuTree(jkf);
    const baseJKF = Object.assign({}, jkf, { moves: [jkf.moves[0]] });
    return new KifuTree({ rootNode, baseJKF });
  }

  toJKF(): JSONKifuFormat {
    return kifuTreeToJKF(this.rootNode, this.baseJKF);
  }

  setCurrentPath(path: Path): KifuTree {
    return this.set('currentPath', path) as KifuTree;
  }

  getCurrentNode(): KifuTreeNode {
    return this.getNodeByPath(this.currentPath);
  }

  getNodeByPath(path: Path): KifuTreeNode {
    return findNodeByPath(this.rootNode, path);
  }

  getNodesOnPath(path: Path): KifuTreeNode[] {
    return getNodesOnPath(this.rootNode, this.currentPath);
  }

  updateNode(path: Path, nodeUpdater: (node: KifuTreeNode) => KifuTreeNode | Map<string, any>): KifuTree {
    const keyPath = pathToKeyPath(path);
    const newRootNode = this.rootNode.updateIn(keyPath, (node: KifuTreeNode) => nodeUpdater(node)) as KifuTreeNode;
    return this.set('rootNode', newRootNode) as KifuTree;
  }

  updateFork(path: Path, forkUpdater: (children: List<KifuTreeNode>, lastIndex: number) => List<KifuTreeNode>): KifuTree {
    const currentStringPath = getStringPath(this.rootNode, this.currentPath);
    let newKifuTree = this.updateForkOfKifuTree(path, forkUpdater);
    if (newKifuTree === this) {
      return this; // no change
    }

    const newPath = getPathFromStringPath(newKifuTree.rootNode, currentStringPath);
    return newKifuTree.setCurrentPath(newPath);
  }

  private updateForkOfKifuTree(path: Path, forkUpdater: (children: List<KifuTreeNode>, lastIndex: number) => List<KifuTreeNode>): KifuTree {
    const lastIndex = path.get(path.size - 1);
    const parentPath = path.slice(0, -1);
    return this.updateNode(parentPath, (node: KifuTreeNode) => {
      return node.update('children', (children: List<KifuTreeNode>) => {
        return forkUpdater(children, lastIndex);
      });
    });
  }

  movePiece(move: MoveMoveFormat): KifuTree | false {
    // 1. Compare with existing nodes
    const currentNode = this.getCurrentNode();
    const childIndex = currentNode.children.findIndex((childNode: KifuTreeNode): boolean => JKFPlayer.sameMoveMinimal(childNode.move, move));
    if (childIndex >= 0) {
      return this.setCurrentPath(this.currentPath.concat([childIndex])); // Proceed to existing node
    }

    // 2. Make player then input move
    const minimalMoveFormats = [{}].concat(this.getNodesOnPath(this.currentPath).map(node => ({ move: node.move })));
    const minimalJKF = Object.assign({}, this.baseJKF, { moves: minimalMoveFormats });
    const player = new JKFPlayer(minimalJKF);
    player.goto(minimalMoveFormats.length);

    if (!player.inputMove(move)) {
      return false;
    }

    // 3. Create new objects
    const newMoveFormat = player.kifu.moves[player.kifu.moves.length - 1]; // newMoveFormat is normalized
    const newNode = createKifuTreeNode(player.shogi, currentNode.tesuu + 1, [newMoveFormat]);
    return this
      .updateNode(this.currentPath, (node: KifuTreeNode) => {
        return node.update('children', children => {
          return children.push(newNode);
        });
      })
      .setCurrentPath(this.currentPath.concat([currentNode.children.size]));
  }
}

export type KifuNotebookState = AppState & BoardSetState & CurrentNodeState & KifuTreeState;

export interface AppState {
  message: string;
  autoSaveEnabled: boolean;
  needSave: boolean;
}

export interface BoardSetState {
  kifuTree: KifuTree;
  reversed: boolean;
}

export interface CurrentNodeState {
  kifuTree: KifuTree;
}

export interface KifuTreeState {
  kifuTree: KifuTree;
}
