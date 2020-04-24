import React from "react";
import { IPiece, IPlaceFormat } from "json-kifu-format/dist/src/Formats";

import { BoardSquare } from "./BoardSquare";
import "./Board.css";

export type BoardProps = {
  board: IPiece[][];
  lastMovedPlace: IPlaceFormat | undefined;
};

export const Board: React.FC<BoardProps> = ({ board, lastMovedPlace }) => {
  return (
    <div className="board">
      {board.map((row, i) =>
        row.map((piece, j) => {
          const x = i + 1;
          const y = j + 1;
          const isActive =
            lastMovedPlace != null && lastMovedPlace.x === x && lastMovedPlace.y === y;
          return <BoardSquare key={`${x}-${y}`} piece={piece} isActive={isActive} />;
        })
      )}
    </div>
  );
};
