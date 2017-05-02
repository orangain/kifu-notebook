import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import createSagaMiddleware from 'redux-saga';
import AppContainer from './containers/AppContainer';
import reducer from './reducers';
import rootSaga from './sagas'
import './index.css';

const sagaMiddleware = createSagaMiddleware();
const middlewares = [sagaMiddleware];
const store = createStore(reducer, applyMiddleware(...middlewares));
sagaMiddleware.run(rootSaga);

ReactDOM.render(
  <Provider store={store}>
    <AppContainer />
  </Provider>,
  document.getElementById('root')
);
