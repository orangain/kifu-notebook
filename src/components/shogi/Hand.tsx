import React from "react";

import { Color } from "./types";
import { Piece } from "./Piece";
import "./Hand.css";

export type HandProps = {
  color: Color;
  pieceCounts: { [index: string]: number };
  playerName: string;
  reversed: boolean;
};

const pieceKinds = ["HI", "KA", "KI", "GI", "KE", "KY", "FU"];

const range = (n: number): number[] => [...Array(n)].map((_, i) => i);

export const Hand: React.FC<HandProps> = ({ color, pieceCounts, playerName, reversed }) => {
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
            <div key={kind} className={`piece-slot ${kind}`}>
              <div
                className="piece-slot-inner"
                style={{ paddingRight: `calc(32px - 100% / ${pieceCount})` }}
              >
                {range(pieceCount).map((i) => (
                  <div key={i} className="piece-wrapper">
                    <Piece place={undefined} color={color} kind={kind} reversed={reversed} />
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
