import React from "react";
import { IMoveMoveFormat } from "json-kifu-format/dist/src/Formats";
import { Color } from "shogi.js";

import "./Hand.css";
import { Piece } from "./Piece";

export type HandProps = {
  color: Color;
  pieceCounts: { [index: string]: number };
  playerName: string;
  onInputMove: (move: IMoveMoveFormat) => void;
};

const pieceKinds = ["HI", "KA", "KI", "GI", "KE", "KY", "FU"];

const range = (n: number): number[] => [...Array(n)].map((_, i) => i);

export const Hand: React.FC<HandProps> = ({ color, pieceCounts, playerName }) => {
  return (
    <div className="hand">
      <div className="player-name">{playerName}</div>
      <div className="piece-slots">
        {pieceKinds.map((kind) => {
          const pieceCount = pieceCounts[kind];
          if (pieceCount === 0) {
            return null;
          }
          return (
            <div className={`piece-slot ${kind}`}>
              <div
                className="piece-slot-inner"
                style={{ paddingRight: `calc(32px - 100% / ${pieceCount})` }}
              >
                {range(pieceCount).map(() => (
                  <div className="piece-wrapper">
                    <Piece place={undefined} color={color} kind={kind} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
