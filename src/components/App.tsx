import React, { Component, Profiler } from "react";

import BoardSetContainer from "../containers/BoardSetContainer";
import KifuTreeContainer from "../containers/KifuTreeContainer";
import CurrentNodeContainer from "../containers/CurrentNodeContainer";

import "./App.css";
const logo = require("./logo.svg");

export interface AppStateProps {
  message: string;
  autoSaveEnabled: boolean;
  needSave: boolean;
}

export interface AppDispatchProps {
  onLoad: () => any;
  onClickSave: () => any;
  onChangeAutoSave: (enabled: boolean) => any;
}

class App extends Component<AppStateProps & AppDispatchProps, {}> {
  componentDidMount() {
    this.props.onLoad();
    window.addEventListener("beforeunload", (e: BeforeUnloadEvent) => {
      if (this.props.needSave) {
        e.returnValue = "変更が保存されていません。"; // Custom message will not be shown.
      }
    });
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <div className="global-controls">
            <span className="message">{this.props.message}</span>
            <label>
              <input
                type="checkbox"
                checked={this.props.autoSaveEnabled}
                onChange={(e) => this.props.onChangeAutoSave(e.target.checked)}
              />
              AutoSave
            </label>
            <button onClick={(e) => this.props.onClickSave()}>Save</button>
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
  }
}

export default App;
