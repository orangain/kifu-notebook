import { Record, Map, List } from 'immutable';
import { KifuTreeNode, jkfToKifuTree, kifuTreeToJKF, Path, pathToKeyPath, findNodeByPath, getNodesOnPath } from "./treeUtils";
import { JSONKifuFormat } from "./shogiUtils";

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
