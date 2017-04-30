import { connect } from 'react-redux';

import { findNodeByPath, buildJumpMap, getPreviousForkPath, getNextForkPath } from "../treeUtils";
import { changeComments, gotoPath } from '../actions';
import CurrentNode from '../components/CurrentNode';

const mapStateToProps = (state) => {
  //console.log(state);
  const currentNode = findNodeByPath(state.kifuTree, state.currentPath);
  const jumpMap = buildJumpMap(state.kifuTree);
  const previousPath = state.currentPath.size > 0 ? state.currentPath.slice(0, state.currentPath.size - 1) : state.currentPath;
  const nextPath = currentNode.children.size > 0 ? state.currentPath.concat([0]) : state.currentPath;
  const previousForkPath = getPreviousForkPath(state.kifuTree, state.currentPath);
  const nextForkPath = getNextForkPath(state.kifuTree, state.currentPath);

  return {
    currentNode: currentNode,
    currentPath: state.currentPath,
    previousPath: previousPath,
    nextPath: nextPath,
    previousForkPath: previousForkPath,
    nextForkPath: nextForkPath,
    jumpMap: jumpMap,
  }
};

const mapDispatchToProps = {
  onChangeComments: changeComments,
  onClickPath: gotoPath,
};

const CurrentNodeContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(CurrentNode);
export default CurrentNodeContainer;
