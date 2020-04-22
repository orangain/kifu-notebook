import React, { RefObject } from "react";
import KifuTreeNodeComponent from "./KifuTreeNode";
import { List } from "immutable";

import "./KifuTree.css";
import { KifuTree, Path } from "../../models";

export interface KifuTreeStateProps {
  kifuTree: KifuTree;
  currentPathChanged: boolean;
}

export interface KifuTreeDispatchProps {
  onClickPath: (path: Path) => void;
  onClickMoveUpFork: (path: Path) => void;
  onClickMoveDownFork: (path: Path) => void;
  onClickRemoveFork: (path: Path) => void;
}

export default class KifuTreeComponent extends React.Component<
  KifuTreeStateProps & KifuTreeDispatchProps,
  {}
> {
  rootElementRef: RefObject<HTMLUListElement>;

  constructor(props: any) {
    super(props);
    this.rootElementRef = React.createRef();
  }

  onClick(e: React.MouseEvent<HTMLUListElement>) {
    const target = e.target as any;
    const jsonPath =
      target.dataset.path ||
      target.parentNode.dataset.path ||
      target.parentNode.parentNode.dataset.path;
    if (!jsonPath) {
      return; // do nothing
    }
    const path = List<number>(JSON.parse(jsonPath)) as Path;

    if (target.classList.contains("readable-kifu")) {
      this.props.onClickPath(path);
    } else if (target.classList.contains("up")) {
      this.props.onClickMoveUpFork(path);
    } else if (target.classList.contains("down")) {
      this.props.onClickMoveDownFork(path);
    } else if (target.classList.contains("remove")) {
      this.props.onClickRemoveFork(path);
    }
  }

  componentDidUpdate(prevProps: KifuTreeStateProps & KifuTreeDispatchProps) {
    if (this.props.currentPathChanged) {
      const rootDOMElement = this.rootElementRef.current;
      const currentDOMElement = rootDOMElement.querySelector("span.current");

      const currentElementBoundingRect = currentDOMElement.getBoundingClientRect();
      const needScroll =
        currentElementBoundingRect.left < 0 ||
        currentElementBoundingRect.right > rootDOMElement.clientWidth;
      if (needScroll) {
        const currentElementLeft = rootDOMElement.scrollLeft + currentElementBoundingRect.left;
        const scrollLeft = Math.max(0, currentElementLeft - rootDOMElement.clientWidth / 2);
        rootDOMElement.scrollLeft = scrollLeft;
      }
    }
  }
  render() {
    const { kifuTree, currentPathChanged } = this.props;

    return (
      <ul ref={this.rootElementRef} className="kifu-tree" onClick={(e) => this.onClick(e)}>
        <KifuTreeNodeComponent
          kifuTree={kifuTree}
          kifuTreeNode={kifuTree.rootNode}
          path={List<number>()}
          currentPathChanged={currentPathChanged}
        />
      </ul>
    );
  }
}
