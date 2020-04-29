import { Record } from "immutable";

import { Path } from "./path";
import { KifuTreeNode } from "./kifuTreeNode";
import { SFEN } from "./sfen";

export type JumpMap = { [sfen in SFEN]: JumpTo[] };

export interface IJumpTo {
  readonly node: KifuTreeNode;
  readonly path: Path;
}

export class JumpTo extends Record<IJumpTo>({
  node: null!,
  path: null!,
}) {
  constructor(props: Partial<IJumpTo>) {
    if (!props.node) throw new Error("IJumpTo.node is mandatory");
    if (!props.path) throw new Error("IJumpTo.path is mandatory");
    super(props);
  }
}
