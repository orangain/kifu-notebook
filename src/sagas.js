import { put, call, select, takeEvery, takeLatest } from 'redux-saga/effects';

import {
  REQUEST_GET_JKF, RECEIVE_GET_JKF, CHANGE_AUTO_SAVE,
  MOVE_PIECE, GO_BACK, GO_FORWARD, SCROLL_TO_CENTER,
  CHANGE_COMMENTS, MOVE_UP_FORK, MOVE_DOWN_FORK, REMOVE_FORK,
  storeJKF
} from './actions'
import { getAutoSaveNeeded } from './selectors';
import Api from './api';

export function* watchInputMove() {
  yield takeEvery([MOVE_PIECE, GO_BACK, GO_FORWARD], scrollToCurrentNode);
}

export function* scrollToCurrentNode() {
  yield put({ type: SCROLL_TO_CENTER });
}

export function* watchNeedSave(dispatch) {
  yield takeLatest(
    [CHANGE_AUTO_SAVE, MOVE_PIECE, CHANGE_COMMENTS, MOVE_UP_FORK, MOVE_DOWN_FORK, REMOVE_FORK],
    autoSaveIfNeeded, dispatch);
}

export function* autoSaveIfNeeded(dispatch) {
  const isAutoSaveNeeded = yield select(getAutoSaveNeeded);
  if (isAutoSaveNeeded) {
    dispatch(storeJKF());  // TODO: Replace with put and saga
  }
}

export function* watchFetchJKF() {
  yield takeLatest(REQUEST_GET_JKF, fetchJKF);
}

export function* fetchJKF() {
  // TODO: Handle error
  const jkf = yield call(Api.fetchJKF);
  yield put({ type: RECEIVE_GET_JKF, jkf: jkf });
}

export default function* rootSaga(dispatch) {
  yield [
    watchFetchJKF(),
    watchInputMove(),
    watchNeedSave(dispatch),
  ];
}
