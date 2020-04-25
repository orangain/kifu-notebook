import React from "react";
import { IPiece, IPlaceFormat, IMoveMoveFormat } from "json-kifu-format/dist/src/Formats";

import { BoardSquare } from "./BoardSquare";
import "./Board.css";

export type BoardProps = {
  board: IPiece[][];
  lastMovedPlace: IPlaceFormat | undefined;
  reversed: boolean;
  onInputMove: (move: IMoveMoveFormat) => void;
};

export const Board: React.FC<BoardProps> = ({ board, lastMovedPlace, reversed, onInputMove }) => {
  return (
    <div className={`board ${reversed ? "reversed" : ""}`}>
      {board.map((row, i) =>
        row.map((piece, j) => {
          const x = i + 1;
          const y = j + 1;
          const isActive =
            lastMovedPlace != null && lastMovedPlace.x === x && lastMovedPlace.y === y;
          return (
            <BoardSquare
              key={`${x}-${y}`}
              place={{ x, y }}
              piece={piece}
              isActive={isActive}
              reversed={reversed}
              onInputMove={onInputMove}
            />
          );
        })
      )}
    </div>
  );
};
