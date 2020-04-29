import { Record } from "immutable";

import { Path } from "./path";

export interface IJumpTarget {
  readonly path: Path;
  readonly comment: string;
  readonly readableKifu: string;
}

export class JumpTarget extends Record<IJumpTarget>({
  path: null!,
  comment: "",
  readableKifu: "",
}) {
  constructor(props: Partial<IJumpTarget>) {
    if (!props.path) throw new Error("JumpTarget.path is mandatory");
    super(props);
  }

  isBad(): boolean {
    return !!this.comment && this.comment.startsWith("bad:");
  }
}
