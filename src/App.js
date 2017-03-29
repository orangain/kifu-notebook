import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import BoardSet from './BoardSet';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Kifu Notebook</h2>
        </div>
        <div className="App-body">
          <BoardSet />
        </div>
      </div>
    );
  }
}

export default App;
