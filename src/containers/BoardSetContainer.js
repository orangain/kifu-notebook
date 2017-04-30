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
  const currentNode = findNodeByPath(state.kifuTree, state.currentPathArray);
  const jumpMap = buildJumpMap(state.kifuTree);
  const previousPathArray = state.currentPathArray.length > 0 ? state.currentPathArray.slice(0, state.currentPathArray.length - 1) : state.currentPathArray;
  const nextPathArray = currentNode.children.size > 0 ? state.currentPathArray.concat([0]) : state.currentPathArray;
  const previousForkPathArray = getPreviousForkPath(state.kifuTree, state.currentPathArray);
  const nextForkPathArray = getNextForkPath(state.kifuTree, state.currentPathArray);

  return {
    player: player,
    reversed: state.reversed,
    currentNode: currentNode,
    currentPathArray: state.currentPathArray,
    previousPathArray: previousPathArray,
    nextPathArray: nextPathArray,
    previousForkPathArray: previousForkPathArray,
    nextForkPathArray: nextForkPathArray,
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
