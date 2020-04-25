import React from "react";

import { JumpTarget } from "../models";

export type ForkListJumpItemProps = {
  jumpTarget: JumpTarget;
  onClick: React.MouseEventHandler;
};

export const ForkListJumpItem: React.FC<ForkListJumpItemProps> = ({ jumpTarget, onClick }) => {
  return (
    <li onClick={onClick} className={jumpTarget.isBad() ? "bad" : ""}>
      ↪ {jumpTarget.readableKifu} <span className="comment">{jumpTarget.comment}</span>
    </li>
  );
};
