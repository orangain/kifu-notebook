import { connect } from 'react-redux';

import { buildJKFPlayerFromState } from "../playerUtils";
import { inputMove, changeComments, gotoPath, moveUpFork, moveDownFork, removeFork } from '../actions';
import BoardSet from '../components/BoardSet';

const mapStateToProps = (state) => {
  console.log(state);
  const player = buildJKFPlayerFromState(state);

  return {
    player: player,
    reversed: state.reversed,
    kifuTree: state.kifuTree,
    currentPath: state.currentPath,
  }
};

const mapDispatchToProps = {
  onInputMove: inputMove,
  onChangeComments: changeComments,
  onClickPath: gotoPath,
  onClickMoveUpFork: moveUpFork,
  onClickMoveDownFork: moveDownFork,
  onClickRemoveFork: removeFork,
};

const BoardSetContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(BoardSet);
export default BoardSetContainer;
