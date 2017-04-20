import { connect } from 'react-redux';

import { buildJKFPlayerFromState } from "../playerUtils";
import { inputMove, changeComments, changeReversed, goBack, goForward } from '../actions';
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
  onChangeComments: changeComments,
  onChangeReversed: changeReversed,
  onClickBack: goBack,
  onClickForward: goForward,
};

const BoardSetContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(BoardSet);
export default BoardSetContainer;
