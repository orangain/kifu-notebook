import * as React from "react";
import * as Immutable from 'immutable';

import './KifuTreeNode.css';
import { Path, JumpMap, KifuTreeNode, JumpTo } from "../../models";

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
  currentPath?: Path;
  currentPathChanged?: boolean;
  jumpMap?: JumpMap;
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
      || (nextProps.currentPathChanged && (isSubPath(this.props.path, this.props.currentPath) || isSubPath(nextProps.path, nextProps.currentPath)))
      || !Immutable.is(nextProps.path, this.props.path);

    return shouldUpdate;
  }
  render() {
    const { kifuTreeNode, path, currentPath, currentPathChanged, jumpMap, jumpMapChanged } = this.props;

    const isJump = !jumpMap;
    const hasComment = !!kifuTreeNode.comment;
    const jsonPath = JSON.stringify(path.toArray());
    const isCurrent = Immutable.is(path, currentPath);
    const isControllable = path.size > 0 && !isJump;

    function renderChildren(): JSX.Element[] {
      if (!jumpMap) {
        return [];
      }

      let children = kifuTreeNode.children.map((childNode: KifuTreeNode, i: number) =>
        <KifuTreeNodeComponent
          key={childNode.readableKifu}
          kifuTreeNode={childNode}
          path={path.concat([i]) as Path}
          currentPath={currentPath}
          currentPathChanged={currentPathChanged}
          jumpMap={jumpMap}
          jumpMapChanged={jumpMapChanged} />
      ).toArray();

      const jumpToList = jumpMap.get(kifuTreeNode.sfen);

      if (jumpToList) {
        jumpToList.filter((jumpTo: JumpTo) => jumpTo.node !== kifuTreeNode).forEach((jumpTo: JumpTo) => {
          children = children.concat(jumpTo.node.children.map((childNode: KifuTreeNode, i: number) =>
            <KifuTreeNodeComponent
              key={"jump-" + childNode.readableKifu}
              kifuTreeNode={childNode}
              path={jumpTo.path.concat([i]) as Path} />
          ).toArray());
        });
      }

      return children;
    }

    return (
      <li className={kifuTreeNode.isBad() ? "bad" : ""}>
        <div className="kifu-tree-node" data-path={jsonPath}>
          <span className={"readable-kifu" + (isCurrent ? " current" : "")}
            title={kifuTreeNode.comment}>{(isJump ? "↪ " : "") + kifuTreeNode.readableKifu + (hasComment ? ' *' : '')}</span>
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
