import { connect, MapDispatchToPropsObject } from 'react-redux';
import { Shogi, JKFPlayer } from '../shogiUtils';

import { findNodeByPath } from '../treeUtils';
import { inputMove, changeReversed } from '../actions';
import BoardSet, { BoardSetStateProps, BoardSetDispatchProps } from '../components/BoardSet';
import { BoardSetState } from "../models";

const mapStateToProps = (state: BoardSetState): BoardSetStateProps => {
  //console.log(state);
  const currentNode = findNodeByPath(state.kifuTree.rootNode, state.currentPath);
  const shogi = new Shogi();
  shogi.initializeFromSFENString(currentNode.sfen);
  const shogiState = JKFPlayer.getState(shogi);

  return {
    shogiState: shogiState,
    kifuTree: state.kifuTree,
    reversed: state.reversed,
    currentNode: currentNode,
  }
};

const mapDispatchToProps: BoardSetDispatchProps & MapDispatchToPropsObject = {
  onInputMove: inputMove,
  onChangeReversed: changeReversed,
};

const BoardSetContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(BoardSet);
export default BoardSetContainer;
