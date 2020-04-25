import { connect } from "react-redux";
import { Shogi } from "shogi.js";

import { inputMove, changeReversed } from "../actions";
import { BoardSet } from "../components/BoardSet";
import { BoardSetState } from "../models";

const mapStateToProps = (state: BoardSetState) => {
  //console.log(state);
  const currentNode = state.kifuTree.getCurrentNode();
  const shogi = new Shogi();
  shogi.initializeFromSFENString(currentNode.sfen);

  return {
    shogi,
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
