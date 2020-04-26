import { Shogi } from "shogi.js";
import { IMoveMoveFormat } from "json-kifu-format/dist/src/Formats";

import { Place } from "./types";
import { BoardProps } from "./Board";
import { HandProps } from "./Hand";

export type ShogiBoardOptions = {
  shogi: Shogi;
  lastMovedPlace: Place | undefined;
  playerNames: [string, string];
  reversed: boolean;
  onInputMove: (move: IMoveMoveFormat) => void;
};

export type ShogiBoard = {
  boardProps: BoardProps;
  handPropsPair: [HandProps, HandProps];
};

export const useShogiBoardSet = ({
  shogi,
  lastMovedPlace,
  playerNames,
  reversed,
  onInputMove,
}: ShogiBoardOptions): ShogiBoard => {
  return {
    boardProps: {
      shogi,
      lastMovedPlace,
      reversed,
      onInputMove,
    },
    handPropsPair: [
      {
        color: !reversed ? 0 : 1,
        pieceCounts: shogi.getHandsSummary(!reversed ? 0 : 1),
        playerName: playerNames[!reversed ? 0 : 1],
        reversed,
      },
      {
        color: !reversed ? 1 : 0,
        pieceCounts: shogi.getHandsSummary(!reversed ? 1 : 0),
        playerName: playerNames[!reversed ? 1 : 0],
        reversed,
      },
    ],
  };
};
