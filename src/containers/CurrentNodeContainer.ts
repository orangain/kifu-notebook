import { connect, MapDispatchToPropsObject } from 'react-redux';

import { findNodeByPath, buildJumpMap, getPreviousForkPath, getNextForkPath } from "../treeUtils";
import { changeComments, gotoPath } from '../actions';
import CurrentNode, { CurrentNodeStateProps, CurrentNodeDispatchProps } from '../components/CurrentNode';
import { CurrentNodeState } from "../models";

const mapStateToProps = (state: CurrentNodeState): CurrentNodeStateProps => {
  //console.log(state);
  const currentNode = findNodeByPath(state.kifuTree.rootNode, state.currentPath);
  const jumpMap = buildJumpMap(state.kifuTree.rootNode);
  const previousPath = state.currentPath.size > 0 ? state.currentPath.slice(0, state.currentPath.size - 1) : state.currentPath;
  const nextPath = currentNode.children.size > 0 ? state.currentPath.concat([0]) : state.currentPath;
  const previousForkPath = getPreviousForkPath(state.kifuTree.rootNode, state.currentPath);
  const nextForkPath = getNextForkPath(state.kifuTree.rootNode, state.currentPath);

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

const mapDispatchToProps: CurrentNodeDispatchProps & MapDispatchToPropsObject = {
  onChangeComments: changeComments,
  onClickPath: gotoPath,
};

const CurrentNodeContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(CurrentNode);
export default CurrentNodeContainer;
