import { JSONKifuFormat, MoveMoveFormat } from "./shogiUtils";
import { Path } from "./treeUtils";

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

export function requestGetJKF() {
  return { type: REQUEST_GET_JKF };
}

export function receiveGetJKF(jkf: JSONKifuFormat) {
  return { type: RECEIVE_GET_JKF, jkf: jkf };
}

export function requestPutJKF() {
  return { type: REQUEST_PUT_JKF };
}

export function receivePutJKF() {
  return { type: RECEIVE_PUT_JKF };
}

export function failPutJKF(e: Error) {
  return { type: FAIL_PUT_JKF, error: e };
}

export function clearMessage() {
  return { type: CLEAR_MESSAGE };
}

export function changeAutoSave(enabled: boolean) {
  //console.log(enabled);
  return { type: CHANGE_AUTO_SAVE, enabled: enabled };
}

export function inputMove(move: MoveMoveFormat) {
  return { type: MOVE_PIECE, move: move };
}

export function changeComments(value: string) {
  return { type: CHANGE_COMMENTS, value: value };
}

export function changeReversed(value: boolean) {
  return { type: CHANGE_REVERSED, value: value };
}

export function gotoPath(path: Path) {
  return { type: GOTO_PATH, path: path };
}

export function moveUpFork(path: Path) {
  return { type: MOVE_UP_FORK, path: path };
}

export function moveDownFork(path: Path) {
  return { type: MOVE_DOWN_FORK, path: path };
}

export function removeFork(path: Path) {
  return { type: REMOVE_FORK, path: path };
}
