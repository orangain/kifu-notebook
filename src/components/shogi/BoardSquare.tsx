import React from "react";
import { IPiece } from "json-kifu-format/dist/src/Formats";

import { Piece } from "./Piece";

export type BoardSquareProps = {
  piece: IPiece;
  isActive: boolean;
};

export const BoardSquare: React.FC<BoardSquareProps> = ({ piece, isActive }) => {
  return (
    <div className={`board-square ${isActive ? "active" : ""}`}>
      {piece.kind && piece.color != null && <Piece kind={piece.kind} color={piece.color} />}
    </div>
  );
};
