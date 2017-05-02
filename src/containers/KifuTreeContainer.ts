import { connect, MapStateToPropsFactory, MapDispatchToProps, MapStateToPropsParam } from 'react-redux';
import * as Immutable from 'immutable';

import { gotoPath, moveUpFork, moveDownFork, removeFork } from '../actions';
import { buildJumpMap, Path, JumpMap } from '../treeUtils';
import KifuTreeComponent, { KifuTreeStateProps, KifuTreeDispatchProps } from '../components/tree/KifuTree';
import { KifuTreeState } from "../models";

const mapStateToProps: MapStateToPropsFactory<KifuTreeStateProps, {}> = () => {
  let prevProps: KifuTreeStateProps | { jumpMap?: JumpMap, currentPath?: Path } = {};

  return (state: KifuTreeState): KifuTreeStateProps => {
    //return (state: KifuTreeState): KifuTreeStateProps => {
    // console.log('mapStateToProps')
    // console.log('  prevProps:', prevProps);
    // console.log('  state:    ', state);

    const jumpMap = buildJumpMap(state.kifuTree.rootNode);
    // calculate here for performance optimization of KifuTreeNode.shouldComponentUpdate
    const jumpMapChanged = !Immutable.is(jumpMap, prevProps.jumpMap);
    const currentPathChanged = !Immutable.is(state.currentPath, prevProps.currentPath);

    const props: KifuTreeStateProps = {
      kifuTree: state.kifuTree,
      currentPath: state.currentPath,
      currentPathChanged: currentPathChanged,
      jumpMap: jumpMap,
      jumpMapChanged: jumpMapChanged,
    };
    prevProps = props;

    return props;
  };
};

const mapDispatchToProps: KifuTreeDispatchProps & MapDispatchToProps<KifuTreeDispatchProps, undefined> = {
  onClickPath: gotoPath,
  onClickMoveUpFork: moveUpFork,
  onClickMoveDownFork: moveDownFork,
  onClickRemoveFork: removeFork,
};

const KifuTreeContainer = connect(
  mapStateToProps as MapStateToPropsParam<KifuTreeStateProps, {}>,
  mapDispatchToProps as MapDispatchToProps<KifuTreeDispatchProps, {}>
)(KifuTreeComponent);
export default KifuTreeContainer;
