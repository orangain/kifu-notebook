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
  if (state.fetching) {
    return false;
  }
  return true;
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
