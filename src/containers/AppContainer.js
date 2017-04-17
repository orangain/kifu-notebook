import { connect } from 'react-redux';

import { storeJKF } from '../actions';
import App from '../components/App';

const mapStateToProps = (state) => {
  return {
  }
};

const mapDispatchToProps = {
  onClickSave: storeJKF,
};

const AppContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
export default AppContainer;
