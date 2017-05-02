import { connect, MapDispatchToPropsObject } from 'react-redux';

import { requestGetJKF, requestPutJKF, changeAutoSave } from '../actions';
import App, { AppStateProps, AppDispatchProps } from '../components/App';
import { AppState } from "../models";

const mapStateToProps = (state: AppState): AppStateProps => {
  return {
    message: state.message,
    autoSaveEnabled: state.autoSaveEnabled,
  }
};

const mapDispatchToProps: AppDispatchProps & MapDispatchToPropsObject = {
  onLoad: requestGetJKF,
  onClickSave: requestPutJKF,
  onChangeAutoSave: changeAutoSave,
};

const AppContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
export default AppContainer;
