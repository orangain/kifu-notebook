import JKFPlayer from "json-kifu-format";

export function jkfToKifuTree(jkf) {
  const kifuTree = createKifuTreeNode(0, jkf.moves);
  return kifuTree;
}

function createKifuTreeNode(tesuu, moveFormats) {
  const moveFormat = moveFormats[0];
  //console.log(tesuu, moveFormats);
  return {
    tesuu: tesuu,
    comment: moveFormat.comments ? moveFormat.comments.join('\n') : undefined,
    move: moveFormat.move,
    time: moveFormat.time,
    special: moveFormat.special,
    readableKifu: tesuu === 0 ? '開始局面' : JKFPlayer.moveToReadableKifu(moveFormat),
    children: moveFormatsToForks(moveFormats).map((moveFormatsOfFork, i) => createKifuTreeNode(tesuu + 1, moveFormatsOfFork)),
  };
}

function moveFormatsToForks(moveFormats) {
  let forks = [];
  if (moveFormats.length >= 2) {
    forks.push(moveFormats.slice(1));
  }

  if (moveFormats[1] && moveFormats[1].forks) {
    forks = forks.concat(moveFormats[1].forks);
  }
  return forks;
}

export function kifuTreeToJKF(kifuTree, baseJKF) {
  const firstMove = Object.assign({}, baseJKF.moves[0]);
  firstMove.comments = kifuTree.comment ? kifuTree.comment.split('\n') : undefined;

  // key order is important for readability
  const newJKF = {
    header: baseJKF.header,
    initial: baseJKF.initial,
    moves: [firstMove].concat(nodesToMoveFormats(kifuTree.children)),
  };
  return newJKF;
}

function nodesToMoveFormats(nodes) {
  const primaryNode = nodes[0];

  if (!primaryNode) {
    return [];
  }

  // key order is important for readability
  const primaryMoveFormat = {
    comments: primaryNode.comment ? primaryNode.comment.split('\n') : undefined,
    move: primaryNode.move,
    time: primaryNode.time,
    special: primaryNode.special,
    forks: nodes.length >= 2 ? nodes.slice(1).map(childNode => nodesToMoveFormats([childNode]))
      : undefined,
  };

  return [primaryMoveFormat].concat(nodesToMoveFormats(primaryNode.children));
}
