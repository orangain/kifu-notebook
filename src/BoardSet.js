import React, { Component } from 'react';
import { DragDropContext } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import './BoardSet.css';

import JKFPlayer from "json-kifu-format";
import { Board, Hand } from 'kifu-for-js';

class BoardSet extends Component {
  constructor() {
    super();

    this.imageDirectoryPath = "./images";
    this.state = {
      player: new JKFPlayer({ header: {}, moves: [{}] }),
      reversed: false,
    };
  }
  onInputMove(move) {
    try {
      if (!this.state.player.inputMove(move)) {
        move.promote = confirm("成りますか？");
        this.state.player.inputMove(move);
      }
    } catch (e) {
      // ignore
    }
    this.setState(this.state);
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
      <div className="boardSet">
        <div className="players left">
          <Hand color={reversed ? 0 : 1} data={playerState.hands[reversed ? 0 : 1]} playerName={players[reversed ? 0 : 1]} ImageDirectoryPath={this.imageDirectoryPath} onInputMove={e => { this.onInputMove(e) }} reversed={reversed} />
        </div>
        <Board board={playerState.board}
          lastMove={player.getMove()}
          ImageDirectoryPath={this.imageDirectoryPath}
          onInputMove={e => { this.onInputMove(e) }}
          reversed={reversed} />
        <div className="players right">
          <Hand color={reversed ? 1 : 0} data={playerState.hands[reversed ? 1 : 0]} playerName={players[reversed ? 1 : 0]} ImageDirectoryPath={this.imageDirectoryPath} onInputMove={e => { this.onInputMove(e) }} reversed={reversed} />
        </div>
      </div>
    )
  }
}

export default DragDropContext(HTML5Backend)(BoardSet);
