import { connect } from 'react-redux';

import { buildJKFPlayerFromState } from "../playerUtils";
import { inputMove, changeReversed } from '../actions';
import BoardSet from '../components/BoardSet';

const mapStateToProps = (state) => {
  //console.log(state);
  const player = buildJKFPlayerFromState(state);

  return {
    player: player,
    reversed: state.reversed,
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
