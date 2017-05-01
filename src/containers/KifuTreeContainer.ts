import { connect } from 'react-redux';
import * as Immutable from 'immutable';

import { gotoPath, moveUpFork, moveDownFork, removeFork } from '../actions';
import { buildJumpMap } from '../treeUtils';
import KifuTree from '../components/tree/KifuTree';

const mapStateToProps = () => {
  let prevProps: any = {};

  return (state) => {
    // console.log('mapStateToProps')
    // console.log('  prevProps:', prevProps);
    // console.log('  state:    ', state);

    const jumpMap = buildJumpMap(state.kifuTree);
    // calculate here for performance optimization of KifuTreeNode.shouldComponentUpdate
    const jumpMapChanged = !Immutable.is(jumpMap, prevProps.jumpMap);
    const currentPathChanged = !Immutable.is(state.currentPath, prevProps.currentPath);

    const props = {
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