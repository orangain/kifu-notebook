import { connect } from 'react-redux';

import { buildJKFPlayerFromState } from "../playerUtils";
import { findNodeByPath, buildJumpMap } from "../treeUtils";
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
  const nextPathArray = currentNode.children.length > 0 ? state.currentPathArray.concat([0]) : state.currentPathArray;

  return {
    player: player,
    reversed: state.reversed,
    currentNode: currentNode,
    previousPathArray: previousPathArray,
    nextPathArray: nextPathArray,
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
