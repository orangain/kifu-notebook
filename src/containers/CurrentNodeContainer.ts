import { connect, MapDispatchToPropsObject } from 'react-redux';

import { buildJumpMap, getPreviousForkPath, getNextForkPath } from "../treeUtils";
import { changeComments, gotoPath } from '../actions';
import CurrentNode, { CurrentNodeStateProps, CurrentNodeDispatchProps } from '../components/CurrentNode';
import { CurrentNodeState } from "../models";

const mapStateToProps = (state: CurrentNodeState): CurrentNodeStateProps => {
  //console.log(state);
  const currentNode = state.kifuTree.getCurrentNode();
  const jumpMap = buildJumpMap(state.kifuTree.rootNode);
  const currentPath = state.kifuTree.currentPath;
  const previousPath = currentPath.size > 0 ? currentPath.slice(0, currentPath.size - 1) : currentPath;
  const nextPath = currentNode.children.size > 0 ? currentPath.concat([0]) : currentPath;
  const previousForkPath = getPreviousForkPath(state.kifuTree.rootNode, currentPath);
  const nextForkPath = getNextForkPath(state.kifuTree.rootNode, currentPath);

  return {
    currentNode: currentNode,
    currentPath: currentPath,
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
