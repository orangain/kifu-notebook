import React, { useRef, useEffect } from "react";
import { List } from "immutable";

import { KifuTree, Path } from "../../models";
import { KifuTreeNodeComponent } from "./KifuTreeNode";
import "./KifuTree.css";

export interface KifuTreeStateProps {
  kifuTree: KifuTree;
}

export interface KifuTreeDispatchProps {
  onClickPath: (path: Path) => void;
  onClickMoveUpFork: (path: Path) => void;
  onClickMoveDownFork: (path: Path) => void;
  onClickRemoveFork: (path: Path) => void;
}

export const KifuTreeComponent: React.FC<KifuTreeStateProps & KifuTreeDispatchProps> = ({
  kifuTree,
  onClickPath,
  onClickMoveUpFork,
  onClickMoveDownFork,
  onClickRemoveFork,
}) => {
  const rootElementRef = useRef<HTMLUListElement>(null);
  const currentPathString = kifuTree.currentPath.toArray().join("-");

  useEffect(() => {
    const rootDOMElement = rootElementRef.current;
    if (!rootDOMElement) return;
    const currentDOMElement = rootDOMElement.querySelector("span.current");
    if (!currentDOMElement) return;

    const currentElementBoundingRect = currentDOMElement.getBoundingClientRect();
    const needScroll =
      currentElementBoundingRect.left < 0 ||
      currentElementBoundingRect.right > rootDOMElement.clientWidth;
    if (needScroll) {
      const currentElementLeft = rootDOMElement.scrollLeft + currentElementBoundingRect.left;
      const scrollLeft = Math.max(0, currentElementLeft - rootDOMElement.clientWidth / 2);
      rootDOMElement.scroll({ left: scrollLeft, behavior: "smooth" });
    }
  }, [currentPathString]);

  function onClick(e: React.MouseEvent<HTMLUListElement>) {
    const target = e.target as HTMLElement;
    const jsonPath =
      target.dataset.path ||
      (target.parentNode as HTMLElement).dataset.path ||
      ((target.parentNode as HTMLElement).parentNode as HTMLElement).dataset.path;
    if (!jsonPath) {
      return; // do nothing
    }
    const path = List<number>(JSON.parse(jsonPath)) as Path;

    if (target.classList.contains("readable-kifu")) {
      onClickPath(path);
    } else if (target.classList.contains("up")) {
      onClickMoveUpFork(path);
    } else if (target.classList.contains("down")) {
      onClickMoveDownFork(path);
    } else if (target.classList.contains("remove")) {
      onClickRemoveFork(path);
    }
  }

  return (
    <ul ref={rootElementRef} className="kifu-tree" onClick={onClick}>
      <KifuTreeNodeComponent
        kifuTreeNode={kifuTree.rootNode}
        path={List<number>()}
        currentPath={kifuTree.currentPath}
      />
    </ul>
  );
};
