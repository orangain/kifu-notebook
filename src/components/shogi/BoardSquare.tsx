import React from "react";
import { useDrop } from "react-dnd";
import { Piece } from "shogi.js";

import { Place, Move } from "./types";
import { Piece as PieceComponent, PieceDragObject } from "./Piece";

export type BoardSquareProps = {
  place: Place;
  piece: Piece | null;
  isActive: boolean;
  reversed: boolean;
  isValidMove: (move: Move) => boolean;
  onMovePiece: (move: Move) => void;
};

export const BoardSquare: React.FC<BoardSquareProps> = ({
  place,
  piece,
  isActive,
  reversed,
  isValidMove,
  onMovePiece,
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
      onMovePiece({
        color: item.color,
        from: item.from,
        to: place,
        kind: item.kind,
      }),
  });
  return (
    <div ref={drop} className={`board-square ${isActive ? "active" : ""}`}>
      {/* Unlike JKF, piece is null when there is no piece in square */}
      {piece && (
        <PieceComponent color={piece.color} kind={piece.kind} place={place} reversed={reversed} />
      )}
    </div>
  );
};
