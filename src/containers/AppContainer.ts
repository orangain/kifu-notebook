import { connect } from "react-redux";

import { requestGetJKF, requestPutJKF, changeAutoSave } from "../actions";
import { App } from "../components/App";
import { AppState } from "../models";

const mapStateToProps = (state: AppState) => {
  return {
    message: state.message,
    autoSaveEnabled: state.autoSaveEnabled,
    needSave: state.needSave,
  };
};

const mapDispatchToProps = {
  onLoad: requestGetJKF,
  onClickSave: requestPutJKF,
  onChangeAutoSave: changeAutoSave,
};

export const AppContainer = connect(mapStateToProps, mapDispatchToProps)(App);
