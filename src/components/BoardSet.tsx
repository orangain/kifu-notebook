import React from "react";
import { DndProvider } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import { Shogi } from "shogi.js";
import { IMoveMoveFormat } from "json-kifu-format/dist/src/Formats";

import { Board } from "./shogi/Board";
import { Hand } from "./shogi/Hand";
import { KifuTree, KifuTreeNode } from "../models";
import "./BoardSet.css";
import { useShogiBoardSet } from "./shogi/hook";

export interface BoardSetStateProps {
  shogi: Shogi;
  kifuTree: KifuTree;
  reversed: boolean;
  currentNode: KifuTreeNode;
}

export interface BoardSetDispatchProps {
  onInputMove: (move: IMoveMoveFormat) => void;
  onChangeReversed: (reversed: boolean) => void;
}

export const BoardSet: React.FC<BoardSetStateProps & BoardSetDispatchProps> = ({
  shogi,
  kifuTree,
  reversed,
  currentNode,
  onInputMove,
  onChangeReversed,
}) => {
  const {
    boardProps,
    handPropsPair: [rightHandProps, leftHandProps],
  } = useShogiBoardSet({
    shogi,
    lastMovedPlace: currentNode.move?.to,
    playerNames: [
      "☗" + (kifuTree.baseJKF.header["先手"] || kifuTree.baseJKF.header["下手"] || "先手"),
      "☖" + (kifuTree.baseJKF.header["後手"] || kifuTree.baseJKF.header["上手"] || "後手"),
    ],
    reversed,
    onInputMove,
  });

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <div className="boardSet">
          <div className="players left">
            <Hand {...leftHandProps} />
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={reversed}
                  onChange={(e) => onChangeReversed(e.target.checked)}
                />
                盤面反転
              </label>
            </div>
          </div>
          <div className="board">
            <Board {...boardProps} />
          </div>
          <div className="players right">
            <Hand {...rightHandProps} />
          </div>
        </div>
      </div>
    </DndProvider>
  );
};
