import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import BoardSetContainer from '../containers/BoardSetContainer';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <div className="global-controls">
            <button onClick={e => this.props.onClickSave()} >Save</button>
          </div>
          <h2>Kifu Notebook</h2>
        </div>
        <div className="App-body">
          <BoardSetContainer ref="wrappedBoardset" />
        </div>
      </div>
    );
  }
}

export default App;
