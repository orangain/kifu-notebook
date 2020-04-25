import { connect } from "react-redux";

import { changeComments, gotoPath, updateComments } from "../actions";
import { CurrentNode } from "../components/CurrentNode";
import { CurrentNodeState } from "../models";

const mapStateToProps = (state: CurrentNodeState) => {
  return {
    kifuTree: state.kifuTree,
  };
};

const mapDispatchToProps = {
  onChangeComments: changeComments,
  onBlurComments: updateComments,
  onClickPath: gotoPath,
};

export const CurrentNodeContainer = connect(mapStateToProps, mapDispatchToProps)(CurrentNode);
