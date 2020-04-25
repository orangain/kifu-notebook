import { Color } from "shogi.js";

export const normalizeColor = (color: Color, reversed: boolean): Color => {
  if (!reversed) {
    return color;
  }
  return (1 - color) as Color;
};
