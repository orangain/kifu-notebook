import React from "react";

import './KifuTreeNode.css';

function isSubPath(myPath, testPath) {
  if (testPath.length < myPath.length) {
    return false;
  }
  return testPath.substr(0, myPath.length - 1) === myPath.substr(0, myPath.length - 1);
}

export default class KifuTreeNode extends React.Component {
  shouldComponentUpdate(nextProps) {
    // if (this.props.pathArray.length <= 1) {
    //   console.log(this.props.pathArray);
    //   console.log('currentPath', nextProps.currentPath !== this.props.currentPath);
    //   console.log('kifuTreeNode', nextProps.kifuTreeNode !== this.props.kifuTreeNode);
    //   console.log('jumpMap', nextProps.jumpMapChanged);
    //   console.log('pathArray', JSON.stringify(nextProps.pathArray) !== JSON.stringify(this.props.pathArray));
    // }
    const nextPath = JSON.stringify(nextProps.pathArray);
    const prevPath = JSON.stringify(this.props.pathArray)
    const shouldUpdate = (nextProps.currentPath !== this.props.currentPath && (isSubPath(prevPath, this.props.currentPath) || isSubPath(nextPath, nextProps.currentPath)))
      || nextProps.kifuTreeNode !== this.props.kifuTreeNode
      || nextProps.jumpMapChanged
      || nextPath !== prevPath;

    return shouldUpdate;
  }
  render() {
    const { kifuTreeNode, pathArray, currentPath, jumpMap, isJump, jumpMapChanged } = this.props;

    const hasComment = kifuTreeNode.comment;
    const path = JSON.stringify(pathArray);
    const isCurrent = path === currentPath
    const isBad = hasComment && kifuTreeNode.comment.startsWith('bad:');
    const isControllable = pathArray.length > 0 && !isJump;

    function renderChildren() {
      if (isJump) {
        return [];
      }

      let children = kifuTreeNode.children.map((childNode, i) =>
        <KifuTreeNode
          key={childNode.readableKifu}
          kifuTreeNode={childNode}
          pathArray={pathArray.concat([i])}
          currentPath={currentPath}
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
              pathArray={jumpTo.pathArray.concat([i])}
              isJump={true} />
          ));
        });
      }

      return children;
    }

    return (
      <li className={isBad ? "bad" : ""}>
        <div className="kifu-tree-node" data-path={path}>
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
