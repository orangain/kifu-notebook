import { List } from "immutable";
import { JKFPlayer } from "json-kifu-format";
import { IJSONKifuFormat, IMoveFormat } from "json-kifu-format/dist/src/Formats";
import { Shogi } from "shogi.js";

import { KifuTreeNode } from "../kifuTreeNode";

export function jkfToKifuTree(jkf: IJSONKifuFormat): KifuTreeNode {
  const shogi = new JKFPlayer(jkf).shogi;
  const kifuTree = createKifuTreeNode(shogi, 0, jkf.moves);
  //fillSFEN(kifuTree, jkf);
  return kifuTree;
}

export function createKifuTreeNode(
  shogi: Shogi,
  tesuu: number,
  moveFormats: IMoveFormat[]
): KifuTreeNode {
  const moveFormat = moveFormats[0];
  //console.log(tesuu, moveFormats);
  return new KifuTreeNode({
    tesuu: tesuu,
    comment: moveFormat.comments ? moveFormat.comments.join("\n") : "",
    move: moveFormat.move,
    time: moveFormat.time,
    special: moveFormat.special,
    readableKifu: tesuu === 0 ? "開始局面" : JKFPlayer.moveToReadableKifu(moveFormat),
    sfen: shogi.toSFENString(tesuu + 1),
    children: List(
      moveFormatsToForks(moveFormats).map((moveFormatsOfFork) => {
        JKFPlayer.doMove(shogi, moveFormatsOfFork[0].move!);
        const childNode = createKifuTreeNode(shogi, tesuu + 1, moveFormatsOfFork);
        JKFPlayer.undoMove(shogi, moveFormatsOfFork[0].move!);
        return childNode;
      })
    ),
  });
}

function moveFormatsToForks(moveFormats: IMoveFormat[]): IMoveFormat[][] {
  let forks: IMoveFormat[][] = [];
  if (moveFormats.length >= 2) {
    forks.push(moveFormats.slice(1));
  }

  if (moveFormats[1] && moveFormats[1].forks) {
    forks = [...forks, ...moveFormats[1].forks];
  }
  return forks;
}
