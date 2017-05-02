import { Record } from 'immutable';
import { KifuTreeNode, jkfToKifuTree, kifuTreeToJKF } from "./treeUtils";
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
