import React, { useEffect, Profiler } from "react";

import { BoardSetContainer } from "../containers/BoardSetContainer";
import { KifuTreeContainer } from "../containers/KifuTreeContainer";
import { CurrentNodeContainer } from "../containers/CurrentNodeContainer";

import "./App.css";
const logo = require("./logo.svg");

export interface AppStateProps {
  message: string;
  autoSaveEnabled: boolean;
  needSave: boolean;
}

export interface AppDispatchProps {
  onLoad: () => void;
  onClickSave: () => void;
  onChangeAutoSave: (enabled: boolean) => void;
}

export const App: React.FC<AppStateProps & AppDispatchProps> = ({
  message,
  autoSaveEnabled,
  needSave,
  onLoad,
  onClickSave,
  onChangeAutoSave,
}) => {
  useEffect(() => {
    onLoad();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (needSave) {
        e.returnValue = "変更が保存されていません。"; // Custom message will not be shown.
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [needSave]);

  return (
    <div className="App">
      <div className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div className="global-controls">
          <span className="message">{message}</span>
          <label>
            <input
              type="checkbox"
              checked={autoSaveEnabled}
              onChange={(e) => onChangeAutoSave(e.target.checked)}
            />
            AutoSave
          </label>
          <button onClick={onClickSave}>Save</button>
        </div>
        <h2>Kifu Notebook</h2>
      </div>
      <div className="App-body">
        <BoardSetContainer />
        <CurrentNodeContainer />
      </div>
      <Profiler
        id="KifuTreeContainer"
        onRender={(id, phase, actualTime, baseTime, startTime, commitTime) =>
          console.log(`${id}[${phase}]: ${Math.ceil(actualTime)}ms`)
        }
      >
        <KifuTreeContainer />
      </Profiler>
    </div>
  );
};
