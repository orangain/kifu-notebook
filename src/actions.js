export const REQUEST_JKF = 'REQUEST_JKF';
export const READ_JKF = 'READ_JKF';
export const MOVE_PIECE = 'MOVE_PIECE';
export const GOTO_PATH = 'GOTO_PATH';
export const CHANGE_COMMENTS = 'CHANGE_COMMENTS';
export const MOVE_UP_FORK = 'MOVE_UP_FORK';
export const MOVE_DOWN_FORK = 'MOVE_DOWN_FORK';
export const REMOVE_FORK = 'REMOVE_FORK';

export function inputMove(move) {
  return { type: MOVE_PIECE, move: move };
}

export function changeComments(value) {
  return { type: CHANGE_COMMENTS, value: value };
}

export function gotoPath(path) {
  return { type: GOTO_PATH, path: path };
}

export function moveUpFork(path) {
  return { type: MOVE_UP_FORK, path: path };
}

export function moveDownFork(path) {
  return { type: MOVE_DOWN_FORK, path: path };
}

export function removeFork(path) {
  return { type: REMOVE_FORK, path: path };
}

export function requestJKF() {
  return { type: REQUEST_JKF };
}

export function readJKF(jkf) {
  return { type: READ_JKF, jkf: jkf };
}

export function fetchJKFIfNeeded() {
  return (dispatch, getState) => {
    if (shouldFetchJKF(getState())) {
      return dispatch(fetchJKF());
    }
  };
}

function shouldFetchJKF(state) {
  if (!state.kifuTree) {
    return true;
  }
  return false;
}

function fetchJKF() {
  return dispatch => {
    dispatch(requestJKF());
    return fetch('/jkf')
      .then(response => response.json())
      .then(json => dispatch(readJKF(json)));
  };
}

export function storeJKF(jkf) {
  return (dispatch, getState) => {
    const state = getState();
    const body = JSON.stringify(state.player.kifu, null, '  ');
    fetch('/jkf', { method: 'PUT', body: body }).then(() => {
      alert('Saved!');
    });
  };
}
