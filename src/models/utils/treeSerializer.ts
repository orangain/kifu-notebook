import { IJSONKifuFormat, IMoveFormat } from "json-kifu-format/dist/src/Formats";

import { KifuTreeNode } from "../kifuTreeNode";

export function kifuTreeToJKF(kifuTree: KifuTreeNode, baseJKF: IJSONKifuFormat): IJSONKifuFormat {
  const firstMove = { ...baseJKF.moves[0] };
  firstMove.comments = kifuTree.comment ? kifuTree.comment.split("\n") : undefined;

  // key order is important for readability
  const newJKF = {
    header: baseJKF.header,
    initial: baseJKF.initial,
    moves: [firstMove, ...nodesToMoveFormats(kifuTree.children.toArray())],
  };
  return newJKF;
}

function nodesToMoveFormats(nodes: KifuTreeNode[]): IMoveFormat[] {
  const primaryNode = nodes[0];

  if (!primaryNode) {
    return [];
  }

  // key order is important for readability
  const primaryMoveFormat: IMoveFormat = {
    comments: primaryNode.comment ? primaryNode.comment.split("\n") : undefined,
    move: primaryNode.move,
    time: primaryNode.time,
    special: primaryNode.special,
    forks:
      nodes.length >= 2
        ? nodes.slice(1).map((childNode) => nodesToMoveFormats([childNode]))
        : undefined,
  };

  return [primaryMoveFormat, ...nodesToMoveFormats(primaryNode.children.toArray())];
}
