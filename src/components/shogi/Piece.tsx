import React from "react";

import { Color } from "shogi.js";

export type PieceProps = {
  color: Color;
  kind: string;
};

export const Piece: React.FC<PieceProps> = ({ color, kind }) => {
  const imageURL = `/images/shogi-pieces/${color + kind}.svg`;
  return <img className="piece" src={imageURL} alt={kind} />;
};
