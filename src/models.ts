import { Record } from 'immutable';
import { KifuTreeNode, jkfToKifuTree, kifuTreeToJKF, Path } from "./treeUtils";
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
}

export type KifuNotebookState = AppState & BoardSetState & CurrentNodeState & KifuTreeState;

export interface AppState {
  message: string;
  autoSaveEnabled: boolean;
  needSave: boolean;
}

export interface BoardSetState {
  kifuTree: KifuTreeNode;
  currentPath: Path;
  jkf: JSONKifuFormat;
  reversed: boolean;
}

export interface CurrentNodeState {
  kifuTree: KifuTreeNode;
  currentPath: Path;
  jkf: JSONKifuFormat;
}

export interface KifuTreeState {
  kifuTree: KifuTreeNode;
  currentPath: Path;
}
