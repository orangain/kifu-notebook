import { delay, Effect } from "redux-saga/effects";
import {
  put,
  call,
  select,
  takeLatest,
  fork,
  take,
  cancel,
  ForkEffect,
} from "redux-saga/effects";

import {
  REQUEST_GET_JKF,
  RECEIVE_GET_JKF,
  REQUEST_PUT_JKF,
  RECEIVE_PUT_JKF,
  FAIL_PUT_JKF,
  CHANGE_AUTO_SAVE,
  MOVE_PIECE,
  CHANGE_COMMENTS,
  UPDATE_COMMENTS,
  MOVE_UP_FORK,
  MOVE_DOWN_FORK,
  REMOVE_FORK,
  receiveGetJKF,
  requestPutJKF,
  receivePutJKF,
  failPutJKF,
  clearMessage,
  updateComments,
} from "./actions";
import { getAutoSaveNeeded, getKifuTree } from "./selectors";
import Api from "./api";
import { KifuTree } from "./models";

export default function* rootSaga(): IterableIterator<Effect[]> {
  yield [
    takeLatest(REQUEST_GET_JKF, fetchJKF),
    takeLatest(REQUEST_PUT_JKF, storeJKF),
    takeLatest(
      [RECEIVE_GET_JKF, RECEIVE_PUT_JKF, FAIL_PUT_JKF],
      clearMessageLater
    ),
    takeLatestWithCancel(CHANGE_COMMENTS, UPDATE_COMMENTS, updateCommentsLater),
    takeLatest(
      [
        CHANGE_AUTO_SAVE,
        MOVE_PIECE,
        UPDATE_COMMENTS,
        MOVE_UP_FORK,
        MOVE_DOWN_FORK,
        REMOVE_FORK,
      ],
      autoSaveIfNeeded
    ),
  ];
}

export function takeLatestWithCancel(
  pattern: string,
  cancelPattern: string,
  saga,
  ...args
): ForkEffect {
  return fork(function* () {
    let lastTask;
    while (true) {
      const action = yield take([pattern, cancelPattern]);
      if (lastTask) {
        yield cancel(lastTask); // cancel is no-op if the task has already terminated
      }

      // TODO: Handle non-string patterns
      if (action.type === cancelPattern) {
        continue;
      }

      lastTask = yield fork(saga, ...args.concat(action));
    }
  });
}

export function* fetchJKF() {
  // TODO: Handle error
  const jkf = yield call(Api.fetchJKF);
  yield put(receiveGetJKF(jkf));
}

export function* storeJKF() {
  const kifuTree: KifuTree = yield select(getKifuTree);
  const jkf = kifuTree.toJKF();
  try {
    yield call(Api.storeJKF, jkf);
    yield put(receivePutJKF());
  } catch (e) {
    yield put(failPutJKF(e));
  }
}

export function* clearMessageLater() {
  yield delay(5000);
  yield put(clearMessage());
}

export function* updateCommentsLater() {
  yield delay(1000);
  yield put(updateComments());
}

export function* autoSaveIfNeeded() {
  const isAutoSaveNeeded = yield select(getAutoSaveNeeded);
  if (isAutoSaveNeeded) {
    yield delay(500);
    yield put(requestPutJKF());
  }
}
