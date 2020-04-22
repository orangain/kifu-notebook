import React from "react";

import { KifuTreeNode, Path } from "../models";
import ForkListItem from "./ForkListItem";
import ForkListJumpItem from "./ForkListJumpItem";
import "./ForkList.css";

interface ForkListProps {
  currentNode: KifuTreeNode;
  currentPath: Path;
  onClickPath: (path: Path) => void;
}

const ForkList: React.FC<ForkListProps> = ({ currentNode, currentPath, onClickPath }) => {
  return (
    <div className="ForkList">
      <span>次の手</span>
      <ul>
        {currentNode.children.size + currentNode.jumpTargets.size > 0 ? (
          [
            ...currentNode.children
              .toArray()
              .map((childNode, i) => (
                <ForkListItem
                  key={childNode.readableKifu}
                  childNode={childNode}
                  onClick={() => onClickPath(currentPath.concat([i]))}
                />
              )),
            ...currentNode.jumpTargets
              .toArray()
              .map((jumpTarget) => (
                <ForkListJumpItem
                  key={"jump-" + jumpTarget.readableKifu}
                  jumpTarget={jumpTarget}
                  onClick={() => onClickPath(jumpTarget.path)}
                />
              )),
          ]
        ) : (
          <li key="なし">なし</li>
        )}
      </ul>
    </div>
  );
};

export default ForkList;
