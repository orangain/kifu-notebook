import React from "react";

import './KifuTreeNode.css';

export default class KifuTreeNode extends React.Component {
  moveUpFork(e, index) {
    const node = this.props.kifuTreeNode;
    if (index === 0) {
      e.stopPropagation();
      return; // do nothing
    }

    const childNode = node.children[index];
    node.children[index] = node.children[index - 1];
    node.children[index - 1] = childNode;
  }
  moveDownFork(e, index) {
    const node = this.props.kifuTreeNode;
    if (index === node.children.length - 1) {
      e.stopPropagation();
      return; // do nothing
    }

    const childNode = node.children[index];
    node.children[index] = node.children[index + 1];
    node.children[index + 1] = childNode;
  }
  removeFork(e, index) {
    const node = this.props.kifuTreeNode;
    node.children.splice(index, 1);
  }
  render() {
    const kifuTreeNode = this.props.kifuTreeNode;
    const hasComment = kifuTreeNode.comment;
    const isBad = hasComment && kifuTreeNode.comment.startsWith('bad:');
    return (
      <li className={isBad ? "bad" : ""}>
        <div className="kifu-tree-node">
          <span className={"readable-kifu" + (kifuTreeNode.isCurrent ? " current" : "")}
            data-path={JSON.stringify(kifuTreeNode.path)}
            title={kifuTreeNode.comment}>{kifuTreeNode.readableKifu + (hasComment ? ' *' : '')}</span>
          <span className="controls">
            <span className="up" onClick={e => { this.props.onClickUp(e) }}>↑</span>
            <span className="down" onClick={e => { this.props.onClickDown(e) }}>↓</span>
            <span className="delete" onClick={e => { this.props.onClickRemove(e) }}>×</span>
          </span>
        </div>
        <ul>
          {kifuTreeNode.children.map((childNode, i) =>
            <KifuTreeNode key={childNode.readableKifu} kifuTreeNode={childNode}
              onClickUp={e => this.moveUpFork(e, i)} onClickDown={e => this.moveDownFork(e, i)} onClickRemove={e => this.removeFork(e, i)} />)}
        </ul>
      </li>);
  }
}
