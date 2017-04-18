import React from "react";
import KifuTreeNode from "./KifuTreeNode.js"

import './KifuTree.css';

export default class KifuTree extends React.Component {
  onClick(e) {
    const path = e.target.dataset.path || e.target.parentNode.dataset.path || e.target.parentNode.parentNode.dataset.path;
    if (!path) {
      return; // do nothing
    }
    if (e.target.classList.contains('readable-kifu')) {
      this.props.onClickPath(path);
    } else if (e.target.classList.contains('up')) {
      this.props.onClickMoveUpFork(path);
    } else if (e.target.classList.contains('down')) {
      this.props.onClickMoveDownFork(path);
    } else if (e.target.classList.contains('remove')) {
      this.props.onClickRemoveFork(path);
    }
  }
  render() {
    if (!this.props.kifuTree) {
      return (<div>Waiting tree</div>);
    }

    return (
      <ul className="kifu-tree" onClick={e => this.onClick(e)}>
        <KifuTreeNode kifuTreeNode={this.props.kifuTree} pathArray={[]} currentPath={this.props.currentPath} />
      </ul>
    );
  }
}
