import React from "react";
import Immutable from 'immutable';

import './KifuTreeNode.css';

function isSubPath(myPath, testPath) {
  if (testPath.size < myPath.size) {
    return false;
  }
  return Immutable.is(testPath.slice(0, myPath.size), myPath);
}

export default class KifuTreeNode extends React.Component {
  shouldComponentUpdate(nextProps) {
    // if (this.props.pathArray.length <= 1) {
    //   console.log(this.props.pathArray);
    //   console.log('currentPath', nextProps.currentPath !== this.props.currentPath);
    //   console.log('kifuTreeNode', nextProps.kifuTreeNode !== this.props.kifuTreeNode);
    //   console.log('jumpMap', nextProps.jumpMapChanged);
    //   console.log('pathArray', JSON.stringify(nextProps.pathArray) !== JSON.stringify(this.props.pathArray));
    // }
    const shouldUpdate = nextProps.kifuTreeNode !== this.props.kifuTreeNode
      || nextProps.jumpMapChanged
      || (nextProps.currentPathChanged && (isSubPath(this.props.pathArray, this.props.currentPathArray) || isSubPath(nextProps.pathArray, nextProps.currentPathArray)))
      || !Immutable.is(nextProps.pathArray, this.props.pathArray);

    return shouldUpdate;
  }
  render() {
    const { kifuTreeNode, pathArray, currentPathArray, currentPathChanged, jumpMap, isJump, jumpMapChanged } = this.props;

    const hasComment = !!kifuTreeNode.comment;
    const jsonPath = JSON.stringify(pathArray.toArray());
    const isCurrent = Immutable.is(pathArray, currentPathArray);
    const isControllable = pathArray.size > 0 && !isJump;

    function renderChildren() {
      if (isJump) {
        return [];
      }

      let children = kifuTreeNode.children.map((childNode, i) =>
        <KifuTreeNode
          key={childNode.readableKifu}
          kifuTreeNode={childNode}
          pathArray={pathArray.concat([i])}
          currentPathArray={currentPathArray}
          currentPathChanged={currentPathChanged}
          jumpMap={jumpMap}
          jumpMapChanged={jumpMapChanged} />
      );

      const jumpToList = jumpMap.get(kifuTreeNode.sfen);

      if (jumpToList) {
        jumpToList.filter(jumpTo => jumpTo.node !== kifuTreeNode).forEach(jumpTo => {
          children = children.concat(jumpTo.node.children.map((childNode, i) =>
            <KifuTreeNode
              key={"jump-" + childNode.readableKifu}
              kifuTreeNode={childNode}
              pathArray={jumpTo.pathArray.concat([i])}
              isJump={true} />
          ));
        });
      }

      return children;
    }

    return (
      <li className={kifuTreeNode.isBad() ? "bad" : ""}>
        <div className="kifu-tree-node" data-path={jsonPath}>
          <span className={"readable-kifu" + (isCurrent ? " current" : "")}
            title={kifuTreeNode.comment}>{(isJump ? "↪ " : "") + kifuTreeNode.readableKifu + (hasComment ? ' *' : '')}</span>
          {isControllable ? <span className="controls">
            <span className="up">←</span>
            <span className="down">→</span>
            <span className="remove">×</span>
          </span> : null}
        </div>
        <ul>
          {renderChildren()}
        </ul>
      </li>);
  }
}
