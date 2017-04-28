import React from "react";

import './KifuTreeNode.css';

export default class KifuTreeNode extends React.Component {
  shouldComponentUpdate(nextProps) {
    /*if (this.props.pathArray.length <= 1) {
      console.log(this.props.pathArray);
      console.log(this.props.kifuTreeNode, this.props.pathArray, this.props.currentPath);
      console.log(nextProps.kifuTreeNode, nextProps.pathArray, nextProps.currentPath);
    }*/
    const shouldUpdate = nextProps.currentPath !== this.props.currentPath
      || nextProps.kifuTreeNode !== this.props.kifuTreeNode
      || nextProps.jumpMap !== this.props.jumpMap
      || JSON.stringify(nextProps.pathArray) !== JSON.stringify(this.props.pathArray);

    return shouldUpdate;
  }
  render() {
    const { kifuTreeNode, pathArray, currentPath, jumpMap, isJump } = this.props;

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
          jumpMap={jumpMap} />
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
