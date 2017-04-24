import React, { Component } from 'react';

import './ForkList.css';

export default class ForkList extends Component {
  render() {
    const { currentNode, onClickForward } = this.props;
    return (
      <div className="ForkList">
        <span>次の手</span>
        <ul>
          {currentNode.children.length === 0 ? <li>なし</li> : currentNode.children.map((childNode, i) => (
            <li
              key={childNode.readableKifu}
              onClick={e => onClickForward(i)}
              className={childNode.comment && childNode.comment.startsWith('bad:') ? 'bad' : ''}>
              {childNode.readableKifu} <span className="comment">{childNode.comment}</span>
            </li>
          ))}
        </ul>
      </div>);
  }
}
