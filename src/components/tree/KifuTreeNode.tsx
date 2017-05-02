import * as React from "react";
import * as Immutable from 'immutable';

import './KifuTreeNode.css';
import { Path, KifuTreeNode, JumpTo, KifuTree } from "../../models";

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
  jumpMapChanged?: boolean;
}

export default class KifuTreeNodeComponent extends React.Component<KifuTreeNodeProps, {}> {
  shouldComponentUpdate(nextProps: KifuTreeNodeProps) {
    // if (this.props.path.length <= 1) {
    //   console.log(this.props.path);
    //   console.log('currentPath', nextProps.currentPath !== this.props.currentPath);
    //   console.log('kifuTreeNode', nextProps.kifuTreeNode !== this.props.kifuTreeNode);
    //   console.log('jumpMap', nextProps.jumpMapChanged);
    //   console.log('path', JSON.stringify(nextProps.path) !== JSON.stringify(this.props.path));
    // }
    const shouldUpdate = nextProps.kifuTreeNode !== this.props.kifuTreeNode
      || nextProps.jumpMapChanged
      || (nextProps.currentPathChanged && (isSubPath(this.props.path, this.props.kifuTree.currentPath) || isSubPath(nextProps.path, nextProps.kifuTree.currentPath)))
      || !Immutable.is(nextProps.path, this.props.path);

    return shouldUpdate;
  }
  render() {
    const { kifuTree, kifuTreeNode, path, currentPathChanged, jumpMapChanged } = this.props;

    const hasComment = !!kifuTreeNode.comment;
    const jsonPath = JSON.stringify(path.toArray());
    const isCurrent = Immutable.is(path, kifuTree.currentPath);
    const isControllable = path.size > 0;

    function renderChildren(): JSX.Element[] {
      let children = kifuTreeNode.children.map((childNode: KifuTreeNode, i: number) =>
        <KifuTreeNodeComponent
          key={childNode.readableKifu}
          kifuTree={kifuTree}
          kifuTreeNode={childNode}
          path={path.concat([i])}
          currentPathChanged={currentPathChanged}
          jumpMapChanged={jumpMapChanged} />
      ).toArray();

      const jumpToList = kifuTree.jumpMap.get(kifuTreeNode.sfen);

      if (jumpToList) {
        jumpToList.filter((jumpTo: JumpTo) => jumpTo.node !== kifuTreeNode).forEach((jumpTo: JumpTo) => {
          children = children.concat(jumpTo.node.children.map((childNode: KifuTreeNode, i: number) =>
            <JumpNode
              key={"jump-" + childNode.readableKifu}
              kifuTree={kifuTree}
              kifuTreeNode={childNode}
              path={jumpTo.path.concat([i])} />
          ).toArray());
        });
      }

      return children;
    }

    return (
      <li className={kifuTreeNode.isBad() ? "bad" : ""}>
        <div className="kifu-tree-node" data-path={jsonPath}>
          <span className={"readable-kifu" + (isCurrent ? " current" : "")}
            title={kifuTreeNode.comment}>{kifuTreeNode.readableKifu + (hasComment ? ' *' : '')}</span>
          {isControllable ? <span className="controls">
            <span className="up">←</span>
            <span className="down">→</span>
            <span className="remove">×</span>
          </span> : null}
        </div>
        <ul>
          {renderChildren()}
        </ul>
      </li>);
  }
}

export class JumpNode extends KifuTreeNodeComponent {
  render() {
    const { kifuTreeNode, path } = this.props;

    const hasComment = !!kifuTreeNode.comment;
    const jsonPath = JSON.stringify(path.toArray());

    return (
      <li className={kifuTreeNode.isBad() ? "bad" : ""}>
        <div className="kifu-tree-node" data-path={jsonPath}>
          <span className="readable-kifu"
            title={kifuTreeNode.comment}>{"↪ " + kifuTreeNode.readableKifu + (hasComment ? ' *' : '')}</span>
        </div>
      </li>);
  }
}
