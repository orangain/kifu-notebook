import React, { Component } from 'react';
import { DragDropContext } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import './BoardSet.css';

import { Board, Hand, Piece } from 'kifu-for-js';

Piece.DecoratedComponent.prototype.getPieceImage = (kind, color) => {
  return `/images/shogi-pieces/${!kind ? "blank.gif" : color + kind + ".svg"}`;
};

import { kifuTree, LOAD_JKF, MOVE_PIECE, GOTO_PATH, CHANGE_COMMENTS, MOVE_UP_FORK, MOVE_DOWN_FORK, REMOVE_FORK } from '../actions';
import KifuTree from './tree/KifuTree';

class BoardSet extends Component {
  constructor() {
    super();
    this.imageDirectoryPath = "./images";
    this.state = kifuTree();
  }
  componentDidMount() {
    fetch('/jkf').then(response => {
      response.json().then(jkf => {
        console.log(jkf);
        this.dispatch({ type: LOAD_JKF, jkf: jkf });
      });
    });
  }
  save() {
    const body = JSON.stringify(this.state.player.kifu, null, '  ');
    fetch('/jkf', { method: 'PUT', body: body }).then(() => {
      alert('Saved');
    });
  }
  onInputMove(move) {
    this.dispatch({ type: MOVE_PIECE, move: move });
  }
  onChangeComments(value) {
    this.dispatch({ type: CHANGE_COMMENTS, value: value });
  }
  loadJKF(jkf) {
    this.dispatch({ type: LOAD_JKF, jkf: jkf });
  }
  gotoPath(path) {
    this.dispatch({ type: GOTO_PATH, path: path });
  }
  moveUpFork(path) {
    this.dispatch({ type: MOVE_UP_FORK, path: path });
  }
  moveDownFork(path) {
    this.dispatch({ type: MOVE_DOWN_FORK, path: path });
  }
  removeFork(path) {
    this.dispatch({ type: REMOVE_FORK, path: path });
  }
  dispatch(action) {
    const newState = kifuTree(this.state, action);
    if (newState !== this.state) {
      this.setState(newState);
    }
  }
  render() {
    const player = this.state.player;
    const reversed = this.state.reversed;
    const playerState = player.getState();
    const players = [
      player.kifu.header["先手"] || player.kifu.header["下手"] || "先手",
      player.kifu.header["後手"] || player.kifu.header["上手"] || "後手",
    ];

    return (
      <div>
        <div className="boardSet">
          <div className="players left">
            <Hand color={reversed ? 0 : 1} data={playerState.hands[reversed ? 0 : 1]} playerName={players[reversed ? 0 : 1]} ImageDirectoryPath={this.imageDirectoryPath} onInputMove={e => { this.onInputMove(e) }} reversed={reversed} />
          </div>
          <div className="board">
            <Board board={playerState.board}
              lastMove={player.getMove()}
              ImageDirectoryPath={this.imageDirectoryPath}
              onInputMove={e => { this.onInputMove(e) }}
              reversed={reversed} />
          </div>
          <div className="players right">
            <Hand color={reversed ? 1 : 0} data={playerState.hands[reversed ? 1 : 0]} playerName={players[reversed ? 1 : 0]} ImageDirectoryPath={this.imageDirectoryPath} onInputMove={e => { this.onInputMove(e) }} reversed={reversed} />
          </div>
          <div>
            <textarea rows="10" className="comment" placeholder="ここに現在の手についてコメントを書けます。" onChange={e => { this.onChangeComments(e.target.value); }} value={this.state.player.getComments().join("\n")}></textarea>
          </div>
        </div>
        <div>
          <KifuTree kifuTree={this.state.kifuTree} currentPath={this.state.currentPath} onClick={e => {
            const path = e.target.dataset.path || e.target.parentNode.dataset.path || e.target.parentNode.parentNode.dataset.path;
            if (!path) {
              return; // do nothing
            }
            if (e.target.classList.contains('readable-kifu')) {
              this.gotoPath(path);
            } else if (e.target.classList.contains('up')) {
              this.moveUpFork(path);
            } else if (e.target.classList.contains('down')) {
              this.moveDownFork(path);
            } else if (e.target.classList.contains('remove')) {
              this.removeFork(path);
            }
          }} />
        </div>
      </div>
    )
  }
}

export default DragDropContext(HTML5Backend)(BoardSet);
