import { connect, MapDispatchToPropsObject } from 'react-redux';

import { findNodeByPath, buildJumpMap, getPreviousForkPath, getNextForkPath, KifuTreeNode, Path } from "../treeUtils";
import { changeComments, gotoPath } from '../actions';
import CurrentNode, { CurrentNodeStateProps, CurrentNodeDispatchProps } from '../components/CurrentNode';
import { JSONKifuFormat } from "../shogiUtils";

interface CurrentNodeState {
  kifuTree: KifuTreeNode;
  currentPath: Path;
  jkf: JSONKifuFormat;
}

const mapStateToProps = (state: CurrentNodeState): CurrentNodeStateProps => {
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

const mapDispatchToProps: CurrentNodeDispatchProps & MapDispatchToPropsObject = {
  onChangeComments: changeComments,
  onClickPath: gotoPath,
};

const CurrentNodeContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(CurrentNode);
export default CurrentNodeContainer;
