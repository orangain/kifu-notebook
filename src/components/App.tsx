import * as React from 'react';
import { Component } from 'react';
const logo = require('./logo.svg');
import './App.css';
import BoardSetContainer from '../containers/BoardSetContainer';
import KifuTreeContainer from '../containers/KifuTreeContainer';
import CurrentNode from '../containers/CurrentNodeContainer';

interface AppProps {
  message: string;
  isAutoSaveEnabled: boolean;
  onLoad: () => void;
  onClickSave: () => void;
  onChangeAutoSave: (enabled: boolean) => void;
}

class App extends Component<AppProps, {}> {
  componentWillMount() {
    (window as any).Perf = require('react-addons-perf');
    this.props.onLoad();
  }
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <div className="global-controls">
            <span className="message">{this.props.message}</span>
            <label><input type="checkbox" checked={this.props.isAutoSaveEnabled} onChange={e => this.props.onChangeAutoSave(e.target.checked)} />AutoSave</label>
            <button onClick={e => this.props.onClickSave()} >Save</button>
          </div>
          <h2>Kifu Notebook</h2>
        </div>
        <div className="App-body">
          <BoardSetContainer />
          <CurrentNode />
        </div>
        <KifuTreeContainer />
      </div>
    );
  }
}

export default App;
