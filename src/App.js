import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import BoardSet from './BoardSet';

class App extends Component {
  onClickSave(e) {
    this.refs.wrappedBoardset.child.save();
  }
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <div className="global-controls">
            <button onClick={e => this.onClickSave(e)} >Save</button>
          </div>
          <h2>Kifu Notebook</h2>
        </div>
        <div className="App-body">
          <BoardSet ref="wrappedBoardset" />
        </div>
      </div>
    );
  }
}

export default App;
