import React from "react";
import { useDrag } from "react-dnd";
import { Color } from "shogi.js";
import { IPlaceFormat } from "json-kifu-format/dist/src/Formats";

export type PieceProps = {
  place: IPlaceFormat | undefined;
  color: Color;
  kind: string;
  reversed: boolean;
};

export type PieceDragObject = {
  type: "piece";
  from: IPlaceFormat | undefined;
  color: Color;
  kind: string;
};

export const Piece: React.FC<PieceProps> = ({ place, color, kind, reversed }) => {
  const item: PieceDragObject = {
    type: "piece",
    color, // Don't use orientation here
    kind,
    from: place,
  };

  const [{ isDragging }, drag] = useDrag({
    item,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const orientation = !reversed ? color : ((1 - color) as Color);
  const imageURL = `/images/shogi-pieces/${orientation}${kind}.svg`;

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
