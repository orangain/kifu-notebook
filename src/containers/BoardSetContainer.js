import { connect } from 'react-redux';

import { buildJKFPlayerFromState } from "../playerUtils";
import { findNodeByPath, buildJumpMap } from "../treeUtils";
import {
  inputMove, changeComments, changeReversed,
  gotoPath, goBack, goForward, goBackFork, goForwardFork
} from '../actions';
import BoardSet from '../components/BoardSet';

const mapStateToProps = (state) => {
  //console.log(state);
  const player = buildJKFPlayerFromState(state);
  const currentNode = findNodeByPath(state.kifuTree, state.currentPathArray);
  const jumpMap = buildJumpMap(state.kifuTree);

  return {
    player: player,
    reversed: state.reversed,
    currentNode: currentNode,
    jumpMap: jumpMap,
  }
};

const mapDispatchToProps = {
  onInputMove: inputMove,
  onChangeComments: changeComments,
  onChangeReversed: changeReversed,
  onClickPath: gotoPath,
  onClickBack: goBack,
  onClickForward: goForward,
  onClickBackFork: goBackFork,
  onClickForwardFork: goForwardFork,
};

const BoardSetContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(BoardSet);
export default BoardSetContainer;
