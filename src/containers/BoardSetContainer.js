import { connect } from 'react-redux';
import { Shogi } from 'shogi.js';
import JKFPlayer from 'json-kifu-format';

import { findNodeByPath } from '../treeUtils';
import { inputMove, changeReversed } from '../actions';
import BoardSet from '../components/BoardSet';

const mapStateToProps = (state) => {
  //console.log(state);
  const currentNode = findNodeByPath(state.kifuTree, state.currentPath);
  const shogi = new Shogi();
  shogi.initializeFromSFENString(currentNode.sfen);
  const shogiState = JKFPlayer.getState(shogi);

  return {
    shogiState: shogiState,
    jkf: state.jkf,
    reversed: state.reversed,
    currentNode: currentNode,
  }
};

const mapDispatchToProps = {
  onInputMove: inputMove,
  onChangeReversed: changeReversed,
};

const BoardSetContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(BoardSet);
export default BoardSetContainer;
