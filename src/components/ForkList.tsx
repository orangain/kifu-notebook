import * as React from "react";
import { Component } from "react";

import "./ForkList.css";
import { KifuTreeNode, Path, KifuTree, JumpTarget } from "../models";

interface ForkListProps {
  kifuTree: KifuTree;
  onClickPath: (path: Path) => void;
}
export default class ForkList extends Component<ForkListProps, {}> {
  render() {
    const { kifuTree, onClickPath } = this.props;
    const { currentPath } = kifuTree;
    const currentNode = kifuTree.getCurrentNode();

    function renderList(): JSX.Element[] {
      const forkList: JSX.Element[] = currentNode.children
        .map((childNode: KifuTreeNode, i: number) => (
          <li
            key={childNode.readableKifu}
            onClick={(e) => onClickPath(currentPath.concat([i]))}
            className={childNode.isBad() ? "bad" : ""}
          >
            {childNode.readableKifu}{" "}
            <span className="comment">{childNode.comment}</span>
          </li>
        ))
        .concat(
          currentNode.jumpTargets.map((jumpTarget: JumpTarget) => (
            <li
              key={"jump-" + jumpTarget.readableKifu}
              onClick={(e) => onClickPath(jumpTarget.path)}
              className={jumpTarget.isBad() ? "bad" : ""}
            >
              ↪ {jumpTarget.readableKifu}{" "}
              <span className="comment">{jumpTarget.comment}</span>
            </li>
          ))
        )
        .toArray();

      if (forkList.length === 0) {
        return [<li key="なし">なし</li>];
      }

      return forkList;
    }
    return (
      <div className="ForkList">
        <span>次の手</span>
        <ul>{renderList()}</ul>
      </div>
    );
  }
}
