import React from "react";
import { useDrop } from "react-dnd";
import { IPlaceFormat, IPiece, IMoveMoveFormat } from "json-kifu-format/dist/src/Formats";

import { Piece, PieceDragObject } from "./Piece";

export type BoardSquareProps = {
  place: IPlaceFormat;
  piece: IPiece;
  isActive: boolean;
  reversed: boolean;
  onInputMove: (move: IMoveMoveFormat) => void;
};

export const BoardSquare: React.FC<BoardSquareProps> = ({
  place,
  piece,
  isActive,
  reversed,
  onInputMove,
}) => {
  const [, drop] = useDrop({
    accept: "piece",
    canDrop: () => true,
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
      {piece.kind && piece.color != null && (
        <Piece place={place} kind={piece.kind} color={piece.color} reversed={reversed} />
      )}
    </div>
  );
};
