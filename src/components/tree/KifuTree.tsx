import * as React from "react";
import * as ReactDOM from "react-dom";
import { default as KifuTreeNodeComponent } from "./KifuTreeNode";
import { List } from "immutable";

import './KifuTree.css';
import { Path, JumpMap } from "../../treeUtils";
import { KifuTree } from "../../models";

export interface KifuTreeStateProps {
  kifuTree: KifuTree;
  currentPath: Path;
  currentPathChanged: boolean;
  jumpMap: JumpMap;
  jumpMapChanged: boolean;
}

export interface KifuTreeDispatchProps {
  onClickPath: (path: Path) => void;
  onClickMoveUpFork: (path: Path) => void;
  onClickMoveDownFork: (path: Path) => void;
  onClickRemoveFork: (path: Path) => void;
}

export default class KifuTreeComponent extends React.Component<KifuTreeStateProps & KifuTreeDispatchProps, {}> {
  begin: Date;

  onClick(e: React.MouseEvent<HTMLUListElement>) {
    const target = e.target as any;
    const jsonPath = target.dataset.path || target.parentNode.dataset.path || target.parentNode.parentNode.dataset.path;
    if (!jsonPath) {
      return; // do nothing
    }
    const path = List<number>(JSON.parse(jsonPath)) as Path;

    if (target.classList.contains('readable-kifu')) {
      this.props.onClickPath(path);
    } else if (target.classList.contains('up')) {
      this.props.onClickMoveUpFork(path);
    } else if (target.classList.contains('down')) {
      this.props.onClickMoveDownFork(path);
    } else if (target.classList.contains('remove')) {
      this.props.onClickRemoveFork(path);
    }
  }
  componentWillUpdate() {
    this.begin = new Date();
  }
  componentDidUpdate(prevProps: KifuTreeStateProps & KifuTreeDispatchProps) {
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
          kifuTreeNode={kifuTree.rootNode}
          path={List<number>()}
          currentPath={currentPath}
          currentPathChanged={currentPathChanged}
          jumpMap={jumpMap}
          jumpMapChanged={jumpMapChanged} />
      </ul>
    );
  }
}
