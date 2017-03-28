import React, { Component } from 'react';
import { DragDropContext } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import './BoardSet.css';

import JKFPlayer from "json-kifu-format";
import { Board, Hand } from 'kifu-for-js';

import { jkfToKifuTree } from './tree';
import KifuTree from './tree/KifuTree';

class BoardSet extends Component {
  constructor() {
    super();

    this.imageDirectoryPath = "./images";
    this.state = {
      player: new JKFPlayer({ header: {}, moves: [{}] }),
      reversed: false,
    };
  }
  componentDidMount() {
    fetch('./joseki.jkf').then(response => {
      response.json().then(jkf => {
        console.log(jkf);
        this.setState({
          player: new JKFPlayer(jkf),
          kifuTree: jkfToKifuTree(jkf),
        });
      });
    });
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
      <div>
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
        <div>
          <KifuTree kifuTree={this.state.kifuTree} onClick={e => {
            if (e.target.dataset.path) {
              this.gotoPath(JSON.parse(e.target.dataset.path));
            } else if (e.target.classList.contains('up') || e.target.classList.contains('down') || e.target.classList.contains('delete')) {
              this.updateJKFFromKifuTree();
            }
          }} />
        </div>
      </div>
    )
  }
}

export default DragDropContext(HTML5Backend)(BoardSet);
