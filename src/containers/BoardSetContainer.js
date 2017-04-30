import { connect } from 'react-redux';

import { buildJKFPlayerFromState } from "../playerUtils";
import { findNodeByPath, buildJumpMap, getPreviousForkPath, getNextForkPath } from "../treeUtils";
import {
  inputMove, changeComments, changeReversed,
  gotoPath, goBackFork, goForwardFork
} from '../actions';
import BoardSet from '../components/BoardSet';

const mapStateToProps = (state) => {
  //console.log(state);
  const player = buildJKFPlayerFromState(state);
  const currentNode = findNodeByPath(state.kifuTree, state.currentPath);
  const jumpMap = buildJumpMap(state.kifuTree);
  const previousPath = state.currentPath.size > 0 ? state.currentPath.slice(0, state.currentPath.size - 1) : state.currentPath;
  const nextPath = currentNode.children.size > 0 ? state.currentPath.concat([0]) : state.currentPath;
  const previousForkPath = getPreviousForkPath(state.kifuTree, state.currentPath);
  const nextForkPath = getNextForkPath(state.kifuTree, state.currentPath);

  return {
    player: player,
    reversed: state.reversed,
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
  onInputMove: inputMove,
  onChangeComments: changeComments,
  onChangeReversed: changeReversed,
  onClickPath: gotoPath,
  onClickBackFork: goBackFork,
  onClickForwardFork: goForwardFork,
};

const BoardSetContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(BoardSet);
export default BoardSetContainer;
