import React, { Component } from 'react';
import { DragDropContext } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import './BoardSet.css';

import { Board, Hand, Piece, PieceHand } from 'kifu-for-js';

// Use svg images
Piece.DecoratedComponent.prototype.getPieceImage = PieceHand.DecoratedComponent.prototype.getPieceImage = (kind, color) => {
  return `/images/shogi-pieces/${!kind ? "blank.gif" : color + kind + ".svg"}`;
};

class BoardSet extends Component {
  render() {
    const { player, reversed } = this.props;
    const playerState = player.getState();
    const players = [
      player.kifu.header["先手"] || player.kifu.header["下手"] || "先手",
      player.kifu.header["後手"] || player.kifu.header["上手"] || "後手",
    ];

    return (
      <div>
        <div className="boardSet">
          <div className="players left">
            <Hand
              color={reversed ? 0 : 1}
              data={playerState.hands[reversed ? 0 : 1]}
              playerName={players[reversed ? 0 : 1]}
              onInputMove={e => { this.props.onInputMove(e) }}
              reversed={reversed} />
          </div>
          <div className="board">
            <Board
              board={playerState.board}
              lastMove={player.getMove()}
              onInputMove={e => { this.props.onInputMove(e) }}
              reversed={reversed} />
          </div>
          <div className="players right">
            <Hand
              color={reversed ? 1 : 0}
              data={playerState.hands[reversed ? 1 : 0]}
              playerName={players[reversed ? 1 : 0]}
              onInputMove={e => { this.props.onInputMove(e) }}
              reversed={reversed} />
          </div>
          <div>
            <textarea
              rows="10"
              className="comment"
              placeholder="ここに現在の手についてコメントを書けます。"
              onChange={e => { this.props.onChangeComments(e.target.value); }}
              value={player.getComments().join("\n")}></textarea>
          </div>
        </div>
      </div>
    )
  }
}

export default DragDropContext(HTML5Backend)(BoardSet);