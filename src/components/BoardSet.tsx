import * as React from 'react';
import { Component } from 'react';
import { DragDropContext } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import './BoardSet.css';

import { Board, Hand, Piece, PieceHand } from 'kifu-for-js';
import { StateFormat, MoveMoveFormat } from "../shogiUtils";
import { KifuTree, KifuTreeNode } from "../models";

// Use svg images
Piece.DecoratedComponent.prototype.getPieceImage = PieceHand.DecoratedComponent.prototype.getPieceImage = (kind: string | null, color: number) => {
  return `/images/shogi-pieces/${!kind ? "blank.gif" : color + kind + ".svg"}`;
};

export interface BoardSetStateProps {
  shogiState: StateFormat;
  kifuTree: KifuTree;
  reversed: boolean;
  currentNode: KifuTreeNode;
}

export interface BoardSetDispatchProps {
  onInputMove: (move: MoveMoveFormat) => void;
  onChangeReversed: (reversed: boolean) => void;
}

class BoardSet extends Component<BoardSetStateProps & BoardSetDispatchProps, {}> {
  render() {
    const { shogiState, kifuTree, reversed, currentNode } = this.props;
    const players = [
      kifuTree.baseJKF.header["先手"] || kifuTree.baseJKF.header["下手"] || "先手",
      kifuTree.baseJKF.header["後手"] || kifuTree.baseJKF.header["上手"] || "後手",
    ];

    return (
      <div>
        <div className="boardSet">
          <div className="players left">
            <Hand
              color={reversed ? 0 : 1}
              data={shogiState.hands[reversed ? 0 : 1]}
              playerName={players[reversed ? 0 : 1]}
              onInputMove={(e: MoveMoveFormat) => { this.props.onInputMove(e) }}
              reversed={reversed} />
            <div>
              <label><input type="checkbox" checked={reversed} onChange={e => this.props.onChangeReversed(e.target.checked)} />盤面反転</label>
            </div>
          </div>
          <div className="board">
            <Board
              board={shogiState.board}
              lastMove={currentNode.move}
              onInputMove={(e: MoveMoveFormat) => { this.props.onInputMove(e) }}
              reversed={reversed} />
          </div>
          <div className="players right">
            <Hand
              color={reversed ? 1 : 0}
              data={shogiState.hands[reversed ? 1 : 0]}
              playerName={players[reversed ? 1 : 0]}
              onInputMove={(e: MoveMoveFormat) => { this.props.onInputMove(e) }}
              reversed={reversed} />
          </div>
        </div>
      </div>
    )
  }
}

export default DragDropContext(HTML5Backend)(BoardSet);
