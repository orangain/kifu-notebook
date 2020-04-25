import React from "react";
import { useDrag } from "react-dnd";
import { Color } from "shogi.js";
import { IPlaceFormat } from "json-kifu-format/dist/src/Formats";

export type PieceProps = {
  place: IPlaceFormat;
  color: Color;
  kind: string;
};

export type PieceDragObject = {
  type: "piece";
  from: IPlaceFormat;
  color: Color;
  kind: string;
};

export const Piece: React.FC<PieceProps> = ({ place, color, kind }) => {
  const item: PieceDragObject = {
    type: "piece",
    color,
    kind,
    from: place,
  };

  const [{ isDragging }, drag] = useDrag({
    item,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const imageURL = `/images/shogi-pieces/${color + kind}.svg`;
  return (
    <img
      ref={drag}
      className="piece"
      src={imageURL}
      alt={kind}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    />
  );
};
