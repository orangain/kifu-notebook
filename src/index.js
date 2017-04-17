import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import AppContainer from './containers/AppContainer';
import reducer from './reducers';
import { fetchJKFIfNeeded } from './actions';
import './index.css';

const middleware = [thunk];
const store = createStore(reducer, applyMiddleware(...middleware));
store.dispatch(fetchJKFIfNeeded());

ReactDOM.render(
  <Provider store={store}>
    <AppContainer />
  </Provider>,
  document.getElementById('root')
);
