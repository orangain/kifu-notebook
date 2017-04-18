import React from "react";

import './KifuTreeNode.css';

export default class KifuTreeNode extends React.Component {
  render() {
    const { kifuTreeNode, pathArray, currentPath } = this.props;

    const hasComment = kifuTreeNode.comment;
    const path = JSON.stringify(pathArray);
    const isCurrent = path === currentPath
    const isBad = hasComment && kifuTreeNode.comment.startsWith('bad:');
    const isControllable = pathArray.length > 0;

    return (
      <li className={isBad ? "bad" : ""}>
        <div className="kifu-tree-node" data-path={path}>
          <span className={"readable-kifu" + (isCurrent ? " current" : "")}
            title={kifuTreeNode.comment}>{kifuTreeNode.readableKifu + (hasComment ? ' *' : '')}</span>
          {isControllable ? <span className="controls">
            <span className="up">←</span>
            <span className="down">→</span>
            <span className="remove">×</span>
          </span> : null}
        </div>
        <ul>
          {kifuTreeNode.children.map((childNode, i) =>
            <KifuTreeNode
              key={childNode.readableKifu}
              kifuTreeNode={childNode}
              pathArray={pathArray.concat([i])}
              currentPath={currentPath} />
          )}
        </ul>
      </li>);
  }
}