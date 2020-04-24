import React from "react";

import { KifuTreeNode } from "../models";

export type ForkListItemProps = {
  childNode: KifuTreeNode;
  onClick: React.MouseEventHandler;
};

const ForkListItem: React.FC<ForkListItemProps> = ({ childNode, onClick }) => {
  return (
    <li onClick={onClick} className={childNode.isBad() ? "bad" : ""}>
      {childNode.readableKifu} <span className="comment">{childNode.comment}</span>
    </li>
  );
};

export default ForkListItem;
