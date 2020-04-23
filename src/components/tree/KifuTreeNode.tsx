import * as React from "react";
import * as Immutable from "immutable";

import { Path, KifuTreeNode, KifuTree, JumpTarget } from "../../models";
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
  kifuTree: KifuTree;
  kifuTreeNode: KifuTreeNode;
  path: Path;
  currentPathChanged?: boolean;
}

export default class KifuTreeNodeComponent extends React.Component<KifuTreeNodeProps, {}> {
  shouldComponentUpdate(nextProps: KifuTreeNodeProps) {
    // if (this.props.path.size <= 1) {
    //   console.log(this.props.path.toArray());
    //   console.log('kifuTreeNode', nextProps.kifuTreeNode !== this.props.kifuTreeNode);
    //   console.log('currentPath', nextProps.currentPathChanged);
    //   console.log('path', JSON.stringify(nextProps.path) !== JSON.stringify(this.props.path));
    // }
    const shouldUpdate =
      nextProps.kifuTreeNode !== this.props.kifuTreeNode ||
      (nextProps.currentPathChanged &&
        (isSubPath(this.props.path, this.props.kifuTree.currentPath) ||
          isSubPath(nextProps.path, nextProps.kifuTree.currentPath))) ||
      !Immutable.is(nextProps.path, this.props.path);

    return shouldUpdate;
  }
  render() {
    const { kifuTree, kifuTreeNode, path, currentPathChanged } = this.props;

    const hasComment = !!kifuTreeNode.comment;
    const jsonPath = JSON.stringify(path.toArray());
    const isCurrent = Immutable.is(path, kifuTree.currentPath);
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
                kifuTree={kifuTree}
                kifuTreeNode={childNode}
                path={path.concat([i])}
                currentPathChanged={currentPathChanged}
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
  }
}
