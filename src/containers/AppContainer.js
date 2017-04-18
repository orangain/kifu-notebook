import { connect } from 'react-redux';

import { fetchJKF, storeJKF, changeAutoSave } from '../actions';
import App from '../components/App';

const mapStateToProps = (state) => {
  return {
    message: state.message,
    autoSaveEnabled: state.autoSaveEnabled,
  }
};

const mapDispatchToProps = {
  onLoad: fetchJKF,
  onClickSave: storeJKF,
  onChangeAutoSave: changeAutoSave,
};

const AppContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
export default AppContainer;
