import { connect, MapDispatchToPropsObject } from 'react-redux';

import { changeComments, gotoPath } from '../actions';
import CurrentNode, { CurrentNodeStateProps, CurrentNodeDispatchProps } from '../components/CurrentNode';
import { CurrentNodeState } from "../models";

const mapStateToProps = (state: CurrentNodeState): CurrentNodeStateProps => {
  return {
    kifuTree: state.kifuTree,
  }
};

const mapDispatchToProps: CurrentNodeDispatchProps & MapDispatchToPropsObject = {
  onChangeComments: changeComments,
  onClickPath: gotoPath,
};

const CurrentNodeContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(CurrentNode);
export default CurrentNodeContainer;
