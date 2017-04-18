import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import BoardSetContainer from '../containers/BoardSetContainer';
import KifuTreeContainer from '../containers/KifuTreeContainer';

class App extends Component {
  componentWillMount() {
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
          <KifuTreeContainer />
        </div>
      </div>
    );
  }
}

export default App;
