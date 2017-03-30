import React from "react";

import './KifuTreeNode.css';

export default class KifuTreeNode extends React.Component {
  render() {
    const kifuTreeNode = this.props.kifuTreeNode;
    const pathArray = this.props.pathArray;
    const path = JSON.stringify(pathArray);
    const hasComment = kifuTreeNode.comment;
    const isBad = hasComment && kifuTreeNode.comment.startsWith('bad:');

    return (
      <li className={isBad ? "bad" : ""}>
        <div className="kifu-tree-node" data-path={path}>
          <span className={"readable-kifu" + (path === this.props.currentPath ? " current" : "")}
            title={kifuTreeNode.comment}>{kifuTreeNode.readableKifu + (hasComment ? ' *' : '')}</span>
          <span className="controls">
            <span className="up">↑</span>
            <span className="down">↓</span>
            <span className="remove">×</span>
          </span>
        </div>
        <ul>
          {kifuTreeNode.children.map((childNode, i) =>
            <KifuTreeNode key={childNode.readableKifu} kifuTreeNode={childNode} pathArray={pathArray.concat([i])} currentPath={this.props.currentPath}
              onClickUp={e => this.moveUpFork(e, i)} onClickDown={e => this.moveDownFork(e, i)} onClickRemove={e => this.removeFork(e, i)} />)}
        </ul>
      </li>);
  }
}
