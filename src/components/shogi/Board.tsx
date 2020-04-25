import React, { useCallback } from "react";
import { IPiece, IPlaceFormat, IMoveMoveFormat } from "json-kifu-format/dist/src/Formats";
import { Shogi, IMove } from "shogi.js";

import { BoardSquare } from "./BoardSquare";
import "./Board.css";

export type BoardProps = {
  shogi: Shogi;
  board: IPiece[][];
  lastMovedPlace: IPlaceFormat | undefined;
  reversed: boolean;
  onInputMove: (move: IMoveMoveFormat) => void;
};

const kansuuji = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];

const range = (n: number): number[] => [...Array(n)].map((_, i) => i);

const placeEquals = (a: IPlaceFormat | undefined, b: IPlaceFormat | undefined): boolean => {
  return (a === undefined && b === undefined) || (a.x === b.x && a.y === b.y);
};

export const Board: React.FC<BoardProps> = ({
  shogi,
  board,
  lastMovedPlace,
  reversed,
  onInputMove,
}) => {
  const isValidMove = useCallback(
    (move: IMove): boolean => {
      if (shogi.turn !== move.color) {
        return false;
      }

      if (move.from) {
        const moves = shogi.getMovesFrom(move.from.x, move.from.y);
        return moves.some((m) => placeEquals(m.from, move.from) && placeEquals(m.to, move.to));
      } else {
        const moves = shogi.getDropsBy(move.color);
        return moves.some(
          (m) =>
            m.kind === move.kind && placeEquals(m.from, move.from) && placeEquals(m.to, move.to)
        );
      }
    },
    [shogi]
  );

  return (
    <div className={`board ${reversed ? "reversed" : ""}`}>
      <div key="origin" className="header-square" />
      {range(9).map((i) => {
        const normalizedI = !reversed ? i : 8 - i;
        const y = normalizedI + 1;
        return (
          <div key={`row-${y}`} className="header-square row">
            {kansuuji[y]}
          </div>
        );
      })}
      {board.map((_, i) => {
        const normalizedI = !reversed ? i : 8 - i;
        const column = board[normalizedI];
        const x = normalizedI + 1;
        return [
          <div key={`column-${x}`} className="header-square column">
            {x}
          </div>,
          ...column.map((_, j) => {
            const normalizedJ = !reversed ? j : 8 - j;
            const piece = column[normalizedJ];
            const y = normalizedJ + 1;
            const isActive =
              lastMovedPlace != null && lastMovedPlace.x === x && lastMovedPlace.y === y;
            return (
              <BoardSquare
                key={`${x}-${y}`}
                place={{ x, y }}
                piece={piece}
                isActive={isActive}
                reversed={reversed}
                isValidMove={isValidMove}
                onInputMove={onInputMove}
              />
            );
          }),
        ];
      })}
    </div>
  );
};
