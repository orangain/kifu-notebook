import { delay } from 'redux-saga'
import { put, call, select, takeEvery, takeLatest } from 'redux-saga/effects';

import {
  REQUEST_GET_JKF, RECEIVE_GET_JKF, REQUEST_PUT_JKF, RECEIVE_PUT_JKF,
  FAIL_PUT_JKF, CLEAR_MESSAGE, CHANGE_AUTO_SAVE,
  MOVE_PIECE, GO_BACK, GO_FORWARD, SCROLL_TO_CENTER,
  CHANGE_COMMENTS, MOVE_UP_FORK, MOVE_DOWN_FORK, REMOVE_FORK
} from './actions';
import { getAutoSaveNeeded, getJKF } from './selectors';
import Api from './api';

export function* watchInputMove() {
  yield takeEvery([MOVE_PIECE, GO_BACK, GO_FORWARD], scrollToCurrentNode);
}

export function* scrollToCurrentNode() {
  yield put({ type: SCROLL_TO_CENTER });
}

export function* watchNeedSave() {
  yield takeLatest(
    [CHANGE_AUTO_SAVE, MOVE_PIECE, CHANGE_COMMENTS, MOVE_UP_FORK, MOVE_DOWN_FORK, REMOVE_FORK],
    autoSaveIfNeeded);
}

export function* autoSaveIfNeeded() {
  const isAutoSaveNeeded = yield select(getAutoSaveNeeded);
  if (isAutoSaveNeeded) {
    yield call(delay, 500);
    yield put({ type: REQUEST_PUT_JKF });
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

export function* watchStoreJKF() {
  yield takeLatest(REQUEST_PUT_JKF, requestPutJKF);
}

export function* requestPutJKF() {
  const jkf = yield select(getJKF);
  try {
    yield call(Api.storeJKF, jkf);
    yield put({ type: RECEIVE_PUT_JKF });
  } catch (e) {
    yield put({ type: FAIL_PUT_JKF, error: e });
  }
}

export function* watchMessage() {
  yield takeLatest([RECEIVE_PUT_JKF, FAIL_PUT_JKF], clearMessageLater);
}

export function* clearMessageLater() {
  yield call(delay, 5000);
  yield put({ type: CLEAR_MESSAGE });
}

export default function* rootSaga() {
  yield [
    watchFetchJKF(),
    watchStoreJKF(),
    watchMessage(),
    watchInputMove(),
    watchNeedSave(),
  ];
}
