import JKFPlayer from "json-kifu-format";
import { Map, List, Record } from 'immutable';

class KifuTreeNode extends Record({
  tesuu: 0,
  comment: undefined,
  move: undefined,
  time: undefined,
  special: undefined,
  readableKifu: '',
  sfen: undefined,
  children: List(),
}) {
  isBad() {
    return this.comment && this.comment.startsWith('bad:');
  }
}

const JumpTo = Record({
  node: null,
  pathArray: null,
});

export function jkfToKifuTree(jkf) {
  const shogi = new JKFPlayer(jkf).shogi;
  const kifuTree = createKifuTreeNode(shogi, 0, jkf.moves);
  //fillSFEN(kifuTree, jkf);
  return kifuTree;
}

function createKifuTreeNode(shogi, tesuu, moveFormats) {
  const moveFormat = moveFormats[0];
  //console.log(tesuu, moveFormats);
  return new KifuTreeNode({
    tesuu: tesuu,
    comment: moveFormat.comments ? moveFormat.comments.join('\n') : undefined,
    move: moveFormat.move,
    time: moveFormat.time,
    special: moveFormat.special,
    readableKifu: tesuu === 0 ? '開始局面' : JKFPlayer.moveToReadableKifu(moveFormat),
    sfen: shogi.toSFENString(tesuu + 1),
    children: List(moveFormatsToForks(moveFormats).map((moveFormatsOfFork, i) => {
      JKFPlayer.doMove(shogi, moveFormatsOfFork[0].move);
      const childNode = createKifuTreeNode(shogi, tesuu + 1, moveFormatsOfFork);
      JKFPlayer.undoMove(shogi, moveFormatsOfFork[0].move);
      return childNode;
    })),
  });
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

export function buildJumpMap(kifuTree) {
  // const begin = new Date();

  const jumpMap = Map().withMutations(jumpMap => {
    const seen = {};

    buildJumpMapFromNode(kifuTree, List());

    function buildJumpMapFromNode(kifuTreeNode, pathArray) {
      const sfen = kifuTreeNode.sfen;
      const jumpTo = new JumpTo({
        node: kifuTreeNode,
        pathArray: pathArray,
      });
      if (seen[sfen]) {
        if (!jumpMap.has(sfen)) {
          jumpMap.set(sfen, List([seen[sfen]]));
        }
        jumpMap.set(sfen, jumpMap.get(sfen).concat([jumpTo]));
      } else {
        seen[sfen] = jumpTo;
      }

      kifuTreeNode.children.forEach((childNode, i) => {
        buildJumpMapFromNode(childNode, pathArray.concat([i]));
      });
    }

  });

  // const end = new Date();
  // console.log(`buildJumpMap: ${end.getTime() - begin.getTime()}ms`);
  // console.log(jumpMap);

  return jumpMap;
}

export function kifuTreeToJKF(kifuTree, baseJKF) {
  const firstMove = Object.assign({}, baseJKF.moves[0]);
  firstMove.comments = kifuTree.comment ? kifuTree.comment.split('\n') : undefined;

  // key order is important for readability
  const newJKF = {
    header: baseJKF.header,
    initial: baseJKF.initial,
    moves: [firstMove].concat(nodesToMoveFormats(kifuTree.children.toArray())),
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

  return [primaryMoveFormat].concat(nodesToMoveFormats(primaryNode.children.toArray()));
}

export function getNodesOnPath(tree, pathArray) {
  const nodes = [];
  let currentNode = tree;
  pathArray.forEach(num => {
    currentNode = currentNode.children.get(num);
    nodes.push(currentNode);
  });

  return nodes;
}

export function getStringPathArray(tree, pathArray) {
  return getNodesOnPath(tree, pathArray).map(node => node.readableKifu);
}

export function pathArrayToKeyPath(pathArray) {
  const keyPath = [];
  pathArray.forEach(num => {
    keyPath.push('children');
    keyPath.push(num);
  });
  return keyPath;
}

export function findNodeByPath(tree, pathArray) {
  if (pathArray.length === 0) {
    return tree;
  }
  const nodes = getNodesOnPath(tree, pathArray);
  return nodes[nodes.length - 1];
}

export function getPreviousForkPath(tree, pathArray) {
  const nodes = getNodesOnPath(tree, pathArray);
  for (let i = nodes.length - 2; i >= 0; i--) {
    const node = nodes[i];
    if (node.children.size >= 2) {
      return pathArray.slice(0, i + 1);
    }
  }
  return [];
}

export function getNextForkPath(tree, pathArray) {
  let currentNode = findNodeByPath(tree, pathArray);
  if (currentNode.children.size === 0) {
    return pathArray;
  }

  const newPathArray = [...pathArray];
  while (true) {
    currentNode = currentNode.children.get(0);
    newPathArray.push(0);
    if (currentNode.children.size !== 1) {
      return newPathArray;
    }
  }
}
