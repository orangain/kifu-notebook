import { connect } from 'react-redux';

import { requestGetJKF, requestPutJKF, changeAutoSave } from '../actions';
import App from '../components/App';

const mapStateToProps = (state) => {
  return {
    message: state.message,
    autoSaveEnabled: state.autoSaveEnabled,
  }
};

const mapDispatchToProps = {
  onLoad: requestGetJKF,
  onClickSave: requestPutJKF,
  onChangeAutoSave: changeAutoSave,
};

const AppContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
export default AppContainer;