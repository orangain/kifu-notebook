import React from "react";
import { DndProvider } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import { Shogi } from "shogi.js";
import { IStateFormat, IMoveMoveFormat } from "json-kifu-format/dist/src/Formats";

import { Board } from "./shogi/Board";
import { Hand } from "./shogi/Hand";
import { KifuTree, KifuTreeNode } from "../models";
import "./BoardSet.css";

export interface BoardSetStateProps {
  shogi: Shogi;
  shogiState: IStateFormat;
  kifuTree: KifuTree;
  reversed: boolean;
  currentNode: KifuTreeNode;
}

export interface BoardSetDispatchProps {
  onInputMove: (move: IMoveMoveFormat) => void;
  onChangeReversed: (reversed: boolean) => void;
}

export const BoardSet: React.FC<BoardSetStateProps & BoardSetDispatchProps> = ({
  shogi,
  shogiState,
  kifuTree,
  reversed,
  currentNode,
  onInputMove,
  onChangeReversed,
}) => {
  const players = [
    "☗" + (kifuTree.baseJKF.header["先手"] || kifuTree.baseJKF.header["下手"] || "先手"),
    "☖" + (kifuTree.baseJKF.header["後手"] || kifuTree.baseJKF.header["上手"] || "後手"),
  ];

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <div className="boardSet">
          <div className="players left">
            <Hand
              color={reversed ? 0 : 1}
              pieceCounts={shogiState.hands[reversed ? 0 : 1]}
              playerName={players[reversed ? 0 : 1]}
              onInputMove={onInputMove}
              reversed={reversed}
            />
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={reversed}
                  onChange={(e) => onChangeReversed(e.target.checked)}
                />
                盤面反転
              </label>
            </div>
          </div>
          <div className="board">
            <Board
              shogi={shogi}
              board={shogiState.board}
              lastMovedPlace={currentNode.move?.to}
              onInputMove={onInputMove}
              reversed={reversed}
            />
          </div>
          <div className="players right">
            <Hand
              color={reversed ? 1 : 0}
              pieceCounts={shogiState.hands[reversed ? 1 : 0]}
              playerName={players[reversed ? 1 : 0]}
              onInputMove={onInputMove}
              reversed={reversed}
            />
          </div>
        </div>
      </div>
    </DndProvider>
  );
};
