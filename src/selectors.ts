import { KifuNotebookState } from "./models";
import { KifuTree } from "./models";

export const getAutoSaveNeeded = (state: KifuNotebookState): boolean => state.autoSaveEnabled && state.needSave;

export const getKifuTree = (state: KifuNotebookState): KifuTree => state.kifuTree;
