import React, { Component } from 'react';
import { DragDropContext } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import './BoardSet.css';

import JKFPlayer from "json-kifu-format";
import { Board } from 'kifu-for-js';

class BoardSet extends Component {
  constructor() {
    super();

    this.imageDirectoryPath = "./images";
    this.state = {
      player: new JKFPlayer({ moves: [{}] }),
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

    return (
      <Board board={player.getState().board}
        lastMove={player.getMove()}
        ImageDirectoryPath={this.imageDirectoryPath}
        onInputMove={e => { this.onInputMove(e) }}
        reversed={reversed} />
    )
  }
}

export default DragDropContext(HTML5Backend)(BoardSet);
