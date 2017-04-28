import { connect } from 'react-redux';

import { gotoPath, moveUpFork, moveDownFork, removeFork } from '../actions';
import { buildJumpMap } from '../treeUtils';
import KifuTree from '../components/tree/KifuTree';

const mapStateToProps = (state) => {
  const currentPath = JSON.stringify(state.currentPathArray);
  const jumpMap = buildJumpMap(state.kifuTree);

  return {
    kifuTree: state.kifuTree,
    currentPath: currentPath,
    booleanCounterOfNeedScroll: state.booleanCounterOfNeedScroll,
    jumpMap: jumpMap,
  }
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
)(KifuTree);
export default KifuTreeContainer;
