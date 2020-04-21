import { connect } from "react-redux";
import * as Immutable from "immutable";

import { gotoPath, moveUpFork, moveDownFork, removeFork } from "../actions";
import KifuTreeComponent, {
  KifuTreeStateProps,
} from "../components/tree/KifuTree";
import { KifuTreeState } from "../models";

const mapStateToProps = () => {
  let prevProps: KifuTreeStateProps | undefined;

  return (state: KifuTreeState): KifuTreeStateProps => {
    //return (state: KifuTreeState): KifuTreeStateProps => {
    // console.log('mapStateToProps')
    // console.log('  prevProps:', prevProps);
    // console.log('  state:    ', state);

    // calculate here for performance optimization of KifuTreeNode.shouldComponentUpdate
    const currentPathChanged =
      !prevProps ||
      !Immutable.is(state.kifuTree.currentPath, prevProps.kifuTree.currentPath);
    // console.log('currentPathChanged: ', currentPathChanged);

    const props: KifuTreeStateProps = {
      kifuTree: state.kifuTree,
      currentPathChanged: currentPathChanged,
    };
    prevProps = props;

    return props;
  };
};

const mapDispatchToProps = {
  onClickPath: gotoPath,
  onClickMoveUpFork: moveUpFork,
  onClickMoveDownFork: moveDownFork,
  onClickRemoveFork: removeFork,
};

const KifuTreeContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(KifuTreeComponent);
export default KifuTreeContainer;
