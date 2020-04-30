import { KifuTree } from "./models";

export type KifuNotebookState = AppState & BoardSetState & CurrentNodeState & KifuTreeState;

export interface AppState {
  message: string;
  autoSaveEnabled: boolean;
  needSave: boolean;
}

export interface BoardSetState {
  kifuTree: KifuTree;
}

export interface CurrentNodeState {
  kifuTree: KifuTree;
}

export interface KifuTreeState {
  kifuTree: KifuTree;
}
