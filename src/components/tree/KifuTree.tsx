import * as React from "react";
import * as ReactDOM from "react-dom";
import { default as KifuTreeNodeComponent } from "./KifuTreeNode";
import { List } from "immutable";

import './KifuTree.css';
import { Path, JumpMap, KifuTreeNode } from "../../treeUtils";

interface KifuTreeProps {
  kifuTree: KifuTreeNode;
  currentPath: Path;
  currentPathChanged: boolean;
  jumpMap: JumpMap;
  jumpMapChanged: boolean;
  onClickPath: (path: Path) => void;
  onClickMoveUpFork: (path: Path) => void;
  onClickMoveDownFork: (path: Path) => void;
  onClickRemoveFork: (path: Path) => void;
}

export default class KifuTree extends React.Component<KifuTreeProps, {}> {
  begin: Date;

  onClick(e) {
    const jsonPath = e.target.dataset.path || e.target.parentNode.dataset.path || e.target.parentNode.parentNode.dataset.path;
    if (!jsonPath) {
      return; // do nothing
    }
    const path = List(JSON.parse(jsonPath)) as Path;

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
  componentWillUpdate() {
    this.begin = new Date();
  }
  componentDidUpdate(prevProps) {
    const end = new Date();
    console.log(`KifuTree ${end.getTime() - this.begin.getTime()}ms`);

    if (this.props.currentPathChanged) {
      const domNode = ReactDOM.findDOMNode(this);
      const currentElementDOMNode = domNode.querySelector('span.current') as Element;

      const currentElementBoundingRect = currentElementDOMNode.getBoundingClientRect();
      const needScroll = currentElementBoundingRect.left < 0 || currentElementBoundingRect.right > domNode.clientWidth;
      if (needScroll) {
        const currentElementLeft = domNode.scrollLeft + currentElementBoundingRect.left;
        const scrollLeft = Math.max(0, currentElementLeft - domNode.clientWidth / 2);
        domNode.scrollLeft = scrollLeft;
      }
    }
  }
  render() {
    const { kifuTree, currentPath, currentPathChanged, jumpMap, jumpMapChanged } = this.props;

    return (
      <ul className="kifu-tree" onClick={e => this.onClick(e)}>
        <KifuTreeNodeComponent
          kifuTreeNode={kifuTree}
          path={List<number>()}
          currentPath={currentPath}
          currentPathChanged={currentPathChanged}
          jumpMap={jumpMap}
          jumpMapChanged={jumpMapChanged} />
      </ul>
    );
  }
}