import { connect, MapDispatchToPropsObject } from 'react-redux';
import { Shogi, JKFPlayer, JSONKifuFormat } from '../shogiUtils';

import { findNodeByPath, KifuTreeNode, Path } from '../treeUtils';
import { inputMove, changeReversed } from '../actions';
import BoardSet, { BoardSetStateProps, BoardSetDispatchProps } from '../components/BoardSet';

interface BoardSetState {
  kifuTree: KifuTreeNode;
  currentPath: Path;
  jkf: JSONKifuFormat;
  reversed: boolean;
}

const mapStateToProps = (state: BoardSetState): BoardSetStateProps => {
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

const mapDispatchToProps: BoardSetDispatchProps & MapDispatchToPropsObject = {
  onInputMove: inputMove,
  onChangeReversed: changeReversed,
};

const BoardSetContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(BoardSet);
export default BoardSetContainer;
