import * as React from 'react';
import { Component } from 'react';

import './ForkList.css';
import { KifuTreeNode, JumpMap, Path, JumpTo } from "../models";

interface ForkListProps {
  currentNode: KifuTreeNode;
  jumpMap: JumpMap;
  currentPath: Path;
  onClickPath: (path: Path) => void;
}
export default class ForkList extends Component<ForkListProps, {}> {
  render() {
    const { currentNode, jumpMap, currentPath, onClickPath } = this.props;

    function renderList(): JSX.Element[] {
      let forkList: JSX.Element[] = [];
      forkList = forkList.concat(currentNode.children.map((childNode: KifuTreeNode, i: number) => (
        <li
          key={childNode.readableKifu}
          onClick={e => onClickPath(currentPath.concat([i]))}
          className={childNode.isBad() ? 'bad' : ''}>
          {childNode.readableKifu} <span className="comment">{childNode.comment}</span>
        </li>
      )).toArray());

      const jumpToList = jumpMap.get(currentNode.sfen);

      if (jumpToList) {
        jumpToList.filter((jumpTo: JumpTo) => jumpTo.node !== currentNode).forEach((jumpTo: JumpTo) => {
          forkList = forkList.concat(jumpTo.node.children.map((childNode: KifuTreeNode, i: number) =>
            <li
              key={"jump-" + childNode.readableKifu}
              onClick={e => onClickPath(jumpTo.path.concat([i]))}
              className={childNode.isBad() ? 'bad' : ''}>
              ↪ {childNode.readableKifu} <span className="comment">{childNode.comment}</span>
            </li>
          ).toArray());
        });
      }

      if (forkList.length === 0) {
        return [<li key="なし">なし</li>];
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
