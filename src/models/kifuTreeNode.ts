import { List, Record } from "immutable";
import { IMoveMoveFormat, ITimeFormat } from "json-kifu-format/dist/src/Formats";

import { JumpTarget } from "./jumpTarget";
import { SFEN } from "./sfen";

export interface IKifuTreeNode {
  readonly tesuu: number;
  readonly comment: string;
  readonly move?: IMoveMoveFormat;
  readonly time?: {
    now: ITimeFormat;
    total: ITimeFormat;
  };
  readonly special?: string;
  readonly readableKifu: string;
  readonly sfen: SFEN;
  readonly children: List<KifuTreeNode>;
  readonly jumpTargets: List<JumpTarget>;
}

export class KifuTreeNode extends Record<IKifuTreeNode>({
  tesuu: 0,
  comment: "",
  move: undefined,
  time: undefined,
  special: undefined,
  readableKifu: "",
  sfen: undefined!,
  children: List(),
  jumpTargets: List(),
}) {
  constructor(props: Partial<IKifuTreeNode>) {
    if (!props.sfen) throw new Error("KifuTreeNode.sfen is mandatory");
    super(props);
  }

  isBad(): boolean {
    return !!this.comment && this.comment.startsWith("bad:");
  }
}
