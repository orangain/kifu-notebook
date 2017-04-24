import { put, takeEvery } from 'redux-saga/effects';

import { MOVE_PIECE, GO_BACK, GO_FORWARD, SCROLL_TO_CENTER } from './actions'

export function* watchInputMove() {
  yield takeEvery([MOVE_PIECE, GO_BACK, GO_FORWARD], scrollToCurrentNode);
}

export function* scrollToCurrentNode() {
  yield put({ type: SCROLL_TO_CENTER });
}

export default function* rootSaga() {
  yield [
    watchInputMove(),
  ];
}
