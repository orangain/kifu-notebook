export const REQUEST_GET_JKF = 'REQUEST_GET_JKF';
export const RECEIVE_GET_JKF = 'RECEIVE_GET_JKF';
export const REQUEST_PUT_JKF = 'REQUEST_PUT_JKF';
export const RECEIVE_PUT_JKF = 'RECEIVE_PUT_JKF';
export const FAIL_PUT_JKF = 'FAIL_PUT_JKF';
export const CLEAR_MESSAGE = 'CLEAR_MESSAGE';
export const CHANGE_AUTO_SAVE = 'CHANGE_AUTO_SAVE';

export const MOVE_PIECE = 'MOVE_PIECE';
export const CHANGE_COMMENTS = 'CHANGE_COMMENTS';
export const CHANGE_REVERSED = 'CHANGE_REVERSED';

export const GOTO_PATH = 'GOTO_PATH';
export const MOVE_UP_FORK = 'MOVE_UP_FORK';
export const MOVE_DOWN_FORK = 'MOVE_DOWN_FORK';
export const REMOVE_FORK = 'REMOVE_FORK';

export function fetchJKF() {
  return dispatch => {
    dispatch(requestGetJKF());
    return fetch('/jkf')
      .then(response => response.json())
      .then(json => dispatch(receiveGetJKF(json)));
  };
}

let clearMessageTimeout;

export function storeJKF(jkf) {

  return (dispatch, getState) => {
    function clearMessageLater() {
      if (clearMessageTimeout) {
        clearTimeout(clearMessageTimeout);
      }
      clearMessageTimeout = setTimeout(() => {
        clearMessageTimeout = undefined;
        dispatch(clearMessage());
      }, 5000);
    }

    dispatch(requestPutJKF());
    const state = getState();
    const body = JSON.stringify(state.jkf, null, '  ');
    fetch('/jkf', { method: 'PUT', body: body })
      .then((response) => {
        if (response.ok) {
          dispatch(receivePutJKF());
        } else {
          console.error(response);
          console.log(body);  // to preserve data
          dispatch(failPutJKF(response));
        }
        clearMessageLater();
      })
      .catch((e) => {
        dispatch(failPutJKF(e));
        console.error(e);
        console.log(body);  // to preserve data
        clearMessageLater();
      });
  };
}

export function requestGetJKF() {
  return { type: REQUEST_GET_JKF };
}

export function receiveGetJKF(jkf) {
  return { type: RECEIVE_GET_JKF, jkf: jkf };
}

export function requestPutJKF() {
  return { type: REQUEST_PUT_JKF };
}

export function receivePutJKF() {
  return { type: RECEIVE_PUT_JKF };
}

export function failPutJKF(e) {
  return { type: FAIL_PUT_JKF, error: e };
}

export function clearMessage() {
  return { type: CLEAR_MESSAGE };
}

export function changeAutoSave(enabled) {
  //console.log(enabled);
  return { type: CHANGE_AUTO_SAVE, enabled: enabled };
}

export function inputMove(move) {
  return { type: MOVE_PIECE, move: move };
}

export function changeComments(value) {
  return { type: CHANGE_COMMENTS, value: value };
}

export function changeReversed(value) {
  return { type: CHANGE_REVERSED, value: value };
}
export function gotoPath(pathArray) {
  return { type: GOTO_PATH, pathArray: pathArray };
}

export function moveUpFork(pathArray) {
  return { type: MOVE_UP_FORK, pathArray: pathArray };
}

export function moveDownFork(pathArray) {
  return { type: MOVE_DOWN_FORK, pathArray: pathArray };
}

export function removeFork(pathArray) {
  return { type: REMOVE_FORK, pathArray: pathArray };
}
