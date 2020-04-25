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

const kansuuji = ["一", "二", "三", "四", "五", "六", "七", "八", "九"];

const range = (n: number): number[] => [...Array(n)].map((_, i) => i);

export const Board: React.FC<BoardProps> = ({ board, lastMovedPlace, reversed, onInputMove }) => {
  return (
    <div className={`board ${reversed ? "reversed" : ""}`}>
      <div key="origin" className="header-square" />
      {range(9).map((i) => (
        <div key={`row-${i}`} className="header-square row">
          {kansuuji[i]}
        </div>
      ))}
      {board.map((row, i) => [
        <div key={`column-${i}`} className="header-square column">
          {i + 1}
        </div>,
        ...row.map((piece, j) => {
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
        }),
      ])}
    </div>
  );
};
