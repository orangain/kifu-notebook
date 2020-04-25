import React from "react";
import { useDrop } from "react-dnd";
import { IMove, Piece } from "shogi.js";
import { IPlaceFormat, IMoveMoveFormat } from "json-kifu-format/dist/src/Formats";

import { Piece as PieceComponent, PieceDragObject } from "./Piece";

export type BoardSquareProps = {
  place: IPlaceFormat;
  piece: Piece;
  isActive: boolean;
  reversed: boolean;
  isValidMove: (move: IMove) => boolean;
  onInputMove: (move: IMoveMoveFormat) => void;
};

export const BoardSquare: React.FC<BoardSquareProps> = ({
  place,
  piece,
  isActive,
  reversed,
  isValidMove,
  onInputMove,
}) => {
  const [, drop] = useDrop({
    accept: "piece",
    canDrop: (item: PieceDragObject) =>
      isValidMove({
        color: item.color,
        from: item.from,
        to: place,
        kind: item.kind,
      }),
    drop: (item: PieceDragObject) =>
      onInputMove({
        color: item.color,
        from: item.from,
        to: place,
        piece: item.kind,
      }),
  });
  return (
    <div ref={drop} className={`board-square ${isActive ? "active" : ""}`}>
      {/* Unlike JKF, piece is null when there is no piece in square */}
      {piece && (
        <PieceComponent place={place} kind={piece.kind} color={piece.color} reversed={reversed} />
      )}
    </div>
  );
};
