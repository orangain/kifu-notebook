import { connect } from "react-redux";

import { gotoPath, moveUpFork, moveDownFork, removeFork } from "../actions";
import { KifuTreeComponent } from "../components/tree/KifuTree";
import { KifuTreeState } from "../store";

const mapStateToProps = (state: KifuTreeState) => {
  return {
    kifuTree: state.kifuTree,
  };
};

const mapDispatchToProps = {
  onClickPath: gotoPath,
  onClickMoveUpFork: moveUpFork,
  onClickMoveDownFork: moveDownFork,
  onClickRemoveFork: removeFork,
};

export const KifuTreeContainer = connect(mapStateToProps, mapDispatchToProps)(KifuTreeComponent);
