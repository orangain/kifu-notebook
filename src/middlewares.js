import { storeJKF } from './actions';

export const autoSave = store => next => action => {
  const result = next(action);
  const state = store.getState();
  console.log(state);
  if (state.autoSaveEnabled && state.needSave) {
    store.dispatch(storeJKF());
  }
  return result;
};
