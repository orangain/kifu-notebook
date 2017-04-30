import React, { Component } from 'react';

import './ForkList.css';

export default class ForkList extends Component {
  render() {
    const { currentNode, jumpMap, currentPathArray, onClickPath } = this.props;

    function renderList() {
      let forkList = [];
      forkList = forkList.concat(currentNode.children.map((childNode, i) => (
        <li
          key={childNode.readableKifu}
          onClick={e => onClickPath(currentPathArray.concat([i]))}
          className={childNode.isBad() ? 'bad' : ''}>
          {childNode.readableKifu} <span className="comment">{childNode.comment}</span>
        </li>
      )).toArray());

      const jumpToList = jumpMap.get(currentNode.sfen);

      if (jumpToList) {
        jumpToList.filter(jumpTo => jumpTo.node !== currentNode).forEach(jumpTo => {
          forkList = forkList.concat(jumpTo.node.children.map((childNode, i) =>
            <li
              key={"jump-" + childNode.readableKifu}
              onClick={e => onClickPath(jumpTo.pathArray.concat([i]))}
              className={childNode.isBad() ? 'bad' : ''}>
              ↪ {childNode.readableKifu} <span className="comment">{childNode.comment}</span>
            </li>
          ).toArray());
        });
      }

      if (forkList.length === 0) {
        return (<li>なし</li>);
      }

      return forkList;
    }
    return (
      <div className="ForkList">
        <span>次の手</span>
        <ul>
          {renderList()}
        </ul>
      </div>);
  }
}
