import { Record, Map } from 'immutable';
import { KifuTreeNode, jkfToKifuTree, kifuTreeToJKF, Path, pathToKeyPath } from "./treeUtils";
import { JSONKifuFormat } from "./shogiUtils";

export class KifuTree extends Record({
  rootNode: null,
  baseJKF: null,
}) {
  readonly rootNode: KifuTreeNode;
  readonly baseJKF: JSONKifuFormat;

  static fromJKF(jkf: JSONKifuFormat): KifuTree {
    const rootNode = jkfToKifuTree(jkf);
    const baseJKF = Object.assign({}, jkf, { moves: [jkf.moves[0]] });
    return new KifuTree({ rootNode, baseJKF });
  }

  toJKF(): JSONKifuFormat {
    return kifuTreeToJKF(this.rootNode, this.baseJKF);
  }

  updateNode(path: Path, nodeUpdater: (node: KifuTreeNode) => KifuTreeNode | Map<string, any>): KifuTree {
    const keyPath = pathToKeyPath(path);
    const newRootNode = this.rootNode.updateIn(keyPath, (node: KifuTreeNode) => nodeUpdater(node)) as KifuTreeNode;
    return this.set('rootNode', newRootNode) as KifuTree;
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
  currentPath: Path;
  reversed: boolean;
}

export interface CurrentNodeState {
  kifuTree: KifuTree;
  currentPath: Path;
}

export interface KifuTreeState {
  kifuTree: KifuTree;
  currentPath: Path;
}
