import { connect } from "react-redux";
import { JKFPlayer } from "json-kifu-format";
import { Shogi } from "shogi.js";

import { inputMove, changeReversed } from "../actions";
import { BoardSet } from "../components/BoardSet";
import { BoardSetState } from "../models";

const mapStateToProps = (state: BoardSetState) => {
  //console.log(state);
  const currentNode = state.kifuTree.getCurrentNode();
  const shogi = new Shogi();
  shogi.initializeFromSFENString(currentNode.sfen);
  const shogiState = JKFPlayer.getState(shogi);

  return {
    shogiState: shogiState,
    kifuTree: state.kifuTree,
    reversed: state.reversed,
    currentNode: currentNode,
  };
};

const mapDispatchToProps = {
  onInputMove: inputMove,
  onChangeReversed: changeReversed,
};

export const BoardSetContainer = connect(mapStateToProps, mapDispatchToProps)(BoardSet);
