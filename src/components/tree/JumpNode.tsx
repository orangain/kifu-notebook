import React from "react";

import { JumpTarget } from "../../models";

export interface JumpNodeProps {
  jumpTarget: JumpTarget;
}

export const JumpNode: React.FC<JumpNodeProps> = ({ jumpTarget }) => {
  const hasComment = !!jumpTarget.comment;
  const jsonPath = JSON.stringify(jumpTarget.path.toArray());

  return (
    <li className={jumpTarget.isBad() ? "bad" : ""}>
      <div className="kifu-tree-node" data-path={jsonPath}>
        <span className="readable-kifu" title={jumpTarget.comment}>
          {"↪ " + jumpTarget.readableKifu + (hasComment ? " *" : "")}
        </span>
      </div>
    </li>
  );
};
