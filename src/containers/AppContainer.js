import { connect } from 'react-redux';

import { fetchJKF, storeJKF } from '../actions';
import App from '../components/App';

const mapStateToProps = (state) => {
  return {
  }
};

const mapDispatchToProps = {
  onLoad: fetchJKF,
  onClickSave: storeJKF,
};

const AppContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
export default AppContainer;
