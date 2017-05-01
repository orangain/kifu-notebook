import { JSONKifuFormat } from "./shogiUtils";

export const getAutoSaveNeeded = (state: { autoSaveEnabled: boolean, needSave: boolean }) => state.autoSaveEnabled && state.needSave;

export const getJKF = (state: { jkf: JSONKifuFormat }) => state.jkf;
