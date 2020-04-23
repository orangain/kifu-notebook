import React from "react";
import Immutable from "immutable";

import { Path, KifuTreeNode, JumpTarget } from "../../models";
import { JumpNode } from "./JumpNode";
import "./KifuTreeNode.css";

function isSubPath(myPath: Path, testPath?: Path): boolean {
  if (!testPath) {
    return false;
  }
  if (testPath.size < myPath.size) {
    return false;
  }
  return Immutable.is(testPath.slice(0, myPath.size), myPath);
}

interface KifuTreeNodeProps {
  kifuTreeNode: KifuTreeNode;
  path: Path;
  currentPath: Path;
}

const KifuTreeNodeNotMemoized: React.FC<KifuTreeNodeProps> = ({
  kifuTreeNode,
  path,
  currentPath,
}) => {
  const hasComment = !!kifuTreeNode.comment;
  const jsonPath = JSON.stringify(path.toArray());
  const isCurrent = Immutable.is(path, currentPath);
  const isControllable = path.size > 0;

  return (
    <li className={kifuTreeNode.isBad() ? "bad" : ""}>
      <div className="kifu-tree-node" data-path={jsonPath}>
        <span
          className={"readable-kifu" + (isCurrent ? " current" : "")}
          title={kifuTreeNode.comment}
        >
          {kifuTreeNode.readableKifu + (hasComment ? " *" : "")}
        </span>
        {isControllable ? (
          <span className="controls">
            <span className="up">←</span>
            <span className="down">→</span>
            <span className="remove">×</span>
          </span>
        ) : null}
      </div>
      <ul>
        {kifuTreeNode.children
          .map((childNode: KifuTreeNode, i: number) => (
            <KifuTreeNodeComponent
              key={childNode.readableKifu}
              kifuTreeNode={childNode}
              path={path.concat([i])}
              currentPath={currentPath}
            />
          ))
          .concat(
            kifuTreeNode.jumpTargets.map((jumpTarget: JumpTarget) => (
              <JumpNode key={"jump-" + jumpTarget.readableKifu} jumpTarget={jumpTarget} />
            ))
          )}
      </ul>
    </li>
  );
};

function propsAreEqual(prevProps: KifuTreeNodeProps, nextProps: KifuTreeNodeProps): boolean {
  return (
    prevProps.kifuTreeNode === nextProps.kifuTreeNode &&
    Immutable.is(prevProps.path, nextProps.path) &&
    (prevProps.currentPath === nextProps.currentPath ||
      (!isSubPath(prevProps.path, prevProps.currentPath) &&
        !isSubPath(nextProps.path, nextProps.currentPath)))
  );
}

export const KifuTreeNodeComponent = React.memo(KifuTreeNodeNotMemoized, propsAreEqual);
