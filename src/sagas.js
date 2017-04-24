import { put, select, takeEvery, takeLatest } from 'redux-saga/effects';

import {
  CHANGE_AUTO_SAVE,
  MOVE_PIECE, GO_BACK, GO_FORWARD, SCROLL_TO_CENTER,
  CHANGE_COMMENTS, MOVE_UP_FORK, MOVE_DOWN_FORK, REMOVE_FORK,
  storeJKF
} from './actions'
import { getAutoSaveNeeded } from './selectors';

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

export default function* rootSaga(dispatch) {
  yield [
    watchInputMove(),
    watchNeedSave(dispatch),
  ];
}
