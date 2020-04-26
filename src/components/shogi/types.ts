import { Color } from "shogi.js";

export { Color };

export type Place = {
  x: number;
  y: number;
};

export type MovePiece = {
  color: Color;
  kind: string;
  from: Place;
  to: Place;
};

export type DropPiece = {
  color: Color;
  kind: string;
  from: undefined;
  to: Place;
};

export type Move = MovePiece | DropPiece;
