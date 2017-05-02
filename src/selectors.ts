import { KifuNotebookState } from "./models";
import { JSONKifuFormat } from "./shogiUtils";

export const getAutoSaveNeeded = (state: KifuNotebookState): boolean => state.autoSaveEnabled && state.needSave;

export const getJKF = (state: KifuNotebookState): JSONKifuFormat => state.jkf;
