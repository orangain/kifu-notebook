import * as React from "react";
import { Component } from "react";
import "./CurrentNode.css";

import ForkList from "./ForkList";
import { Path, KifuTree } from "../models";

export interface CurrentNodeStateProps {
  kifuTree: KifuTree;
}

export interface CurrentNodeDispatchProps {
  onClickPath: (path: Path) => void;
  onChangeComments: (comment: string) => void;
  onBlurComments: () => void;
}

export default class CurrentNode extends Component<
  CurrentNodeStateProps & CurrentNodeDispatchProps
> {
  onChangeComments(comment: string) {
    this.props.onChangeComments(comment);
  }

  render() {
    const { kifuTree } = this.props;
    const currentNode = kifuTree.getCurrentNode();
    const previousPath = kifuTree.getPreviousPath();
    const nextPath = kifuTree.getNextPath();
    const previousForkPath = kifuTree.getPreviousForkPath();
    const nextForkPath = kifuTree.getNextForkPath();
    const comment = currentNode.comment;

    return (
      <div>
        <div>
          {currentNode.tesuu === 0 ? null : currentNode.tesuu + "手目"} {currentNode.readableKifu}
        </div>
        <textarea
          rows={10}
          className="comment"
          placeholder="ここに現在の手についてコメントを書けます。"
          onChange={(e) => {
            this.onChangeComments(e.target.value);
          }}
          onBlur={(e) => {
            this.props.onBlurComments();
          }}
          value={comment}
        ></textarea>
        <div className="buttons">
          <button
            onClick={(e) => this.props.onClickPath(previousForkPath)}
            title="1つ前の分岐に戻る"
          >
            &laquo;
          </button>
          <button onClick={(e) => this.props.onClickPath(previousPath)} title="1手戻る">
            &lt;
          </button>
          <button onClick={(e) => this.props.onClickPath(nextPath)} title="1手進む">
            &gt;
          </button>
          <button onClick={(e) => this.props.onClickPath(nextForkPath)} title="1つ先の分岐に進む">
            &raquo;
          </button>
        </div>
        <ForkList
          currentNode={currentNode}
          currentPath={kifuTree.currentPath}
          onClickPath={this.props.onClickPath}
        />
      </div>
    );
  }
}
