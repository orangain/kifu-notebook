import React from "react";
import Immutable from 'immutable';

import './KifuTreeNode.css';

function isSubPath(myPath, testPath) {
  if (testPath.size < myPath.size) {
    return false;
  }
  return Immutable.is(testPath.slice(0, myPath.size), myPath);
}

export default class KifuTreeNode extends React.Component {
  shouldComponentUpdate(nextProps) {
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
    const { kifuTreeNode, path, currentPath, currentPathChanged, jumpMap, isJump, jumpMapChanged } = this.props;

    const hasComment = !!kifuTreeNode.comment;
    const jsonPath = JSON.stringify(path.toArray());
    const isCurrent = Immutable.is(path, currentPath);
    const isControllable = path.size > 0 && !isJump;

    function renderChildren() {
      if (isJump) {
        return [];
      }

      let children = kifuTreeNode.children.map((childNode, i) =>
        <KifuTreeNode
          key={childNode.readableKifu}
          kifuTreeNode={childNode}
          path={path.concat([i])}
          currentPath={currentPath}
          currentPathChanged={currentPathChanged}
          jumpMap={jumpMap}
          jumpMapChanged={jumpMapChanged} />
      );

      const jumpToList = jumpMap.get(kifuTreeNode.sfen);

      if (jumpToList) {
        jumpToList.filter(jumpTo => jumpTo.node !== kifuTreeNode).forEach(jumpTo => {
          children = children.concat(jumpTo.node.children.map((childNode, i) =>
            <KifuTreeNode
              key={"jump-" + childNode.readableKifu}
              kifuTreeNode={childNode}
              path={jumpTo.path.concat([i])}
              isJump={true} />
          ));
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
