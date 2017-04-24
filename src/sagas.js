import { delay } from 'redux-saga'
import { put, call, select, takeLatest } from 'redux-saga/effects';

import {
  REQUEST_GET_JKF, RECEIVE_GET_JKF, REQUEST_PUT_JKF, RECEIVE_PUT_JKF, FAIL_PUT_JKF,
  CHANGE_AUTO_SAVE, MOVE_PIECE, GO_BACK, GO_FORWARD, GO_BACK_FORK, GO_FORWARD_FORK,
  CHANGE_COMMENTS, MOVE_UP_FORK, MOVE_DOWN_FORK, REMOVE_FORK,
  receiveGetJKF, requestPutJKF, receivePutJKF, failPutJKF, clearMessage, scrollToCenter
} from './actions';
import { getAutoSaveNeeded, getJKF } from './selectors';
import Api from './api';

export default function* rootSaga() {
  yield [
    watchFetchJKF(),
    watchStoreJKF(),
    watchMessage(),
    watchInputMove(),
    watchNeedSave(),
  ];
}

function* watchFetchJKF() {
  yield takeLatest(REQUEST_GET_JKF, fetchJKF);
}

export function* fetchJKF() {
  // TODO: Handle error
  const jkf = yield call(Api.fetchJKF);
  yield put(receiveGetJKF(jkf));
}

function* watchStoreJKF() {
  yield takeLatest(REQUEST_PUT_JKF, storeJKF);
}

export function* storeJKF() {
  const jkf = yield select(getJKF);
  try {
    yield call(Api.storeJKF, jkf);
    yield put(receivePutJKF());
  } catch (e) {
    yield put(failPutJKF(e));
  }
}

function* watchMessage() {
  yield takeLatest([RECEIVE_GET_JKF, RECEIVE_PUT_JKF, FAIL_PUT_JKF], clearMessageLater);
}

export function* clearMessageLater() {
  yield call(delay, 5000);
  yield put(clearMessage());
}

function* watchInputMove() {
  yield takeLatest(
    [MOVE_PIECE, GO_BACK, GO_FORWARD, GO_BACK_FORK, GO_FORWARD_FORK],
    scrollToCurrentNode);
}

export function* scrollToCurrentNode() {
  yield put(scrollToCenter());
}

function* watchNeedSave() {
  yield takeLatest(
    [CHANGE_AUTO_SAVE, MOVE_PIECE, CHANGE_COMMENTS, MOVE_UP_FORK, MOVE_DOWN_FORK, REMOVE_FORK],
    autoSaveIfNeeded);
}

export function* autoSaveIfNeeded() {
  const isAutoSaveNeeded = yield select(getAutoSaveNeeded);
  if (isAutoSaveNeeded) {
    yield call(delay, 500);
    yield put(requestPutJKF());
  }
}
