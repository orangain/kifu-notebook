import { connect } from 'react-redux';

import { gotoPath, moveUpFork, moveDownFork, removeFork } from '../actions';
import { buildJumpMap } from '../treeUtils';
import KifuTree from '../components/tree/KifuTree';

const mapStateToProps = () => {
  let prevProps = {};

  return (state) => {
    // console.log('mapStateToProps')
    // console.log('  prevProps:', prevProps);
    // console.log('  state:    ', state);

    const currentPath = JSON.stringify(state.currentPathArray);
    const jumpMap = buildJumpMap(state.kifuTree);
    const currentPathChanged = currentPath !== prevProps.currentPath;

    const props = {
      kifuTree: state.kifuTree,
      currentPath: currentPath,
      currentPathChanged: currentPathChanged,
      jumpMap: jumpMap,
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
)(KifuTree);
export default KifuTreeContainer;
