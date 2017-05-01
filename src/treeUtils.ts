import { JKFPlayer, JSONKifuFormat, MoveFormat, MoveMoveFormat, TimeFormat, Shogi } from './shogiUtils';
import { Map, List, Iterable, Record } from 'immutable';

export type Path = List<number>;
export type PathLike = Path | Iterable<number, number>
export type SFEN = string;
export type JumpMap = Map<SFEN, List<JumpTo>>;
export class KifuTreeNode extends Record({
  tesuu: 0,
  comment: '',
  move: undefined,
  time: undefined,
  special: undefined,
  readableKifu: '',
  sfen: undefined,
  children: List(),
}) {
  tesuu: number;
  comment?: string;
  move?: MoveMoveFormat;
  time?: {
    now: TimeFormat;
    total: TimeFormat
  };
  special?: string;
  readableKifu: string;
  sfen: SFEN;
  children: List<KifuTreeNode>;

  isBad(): boolean {
    return !!this.comment && this.comment.startsWith('bad:');
  }
}

export class JumpTo extends Record({
  node: null,
  path: null,
}) {
  node: KifuTreeNode;
  path: Path;
}

export function jkfToKifuTree(jkf: JSONKifuFormat): KifuTreeNode {
  const shogi = new JKFPlayer(jkf).shogi;
  const kifuTree = createKifuTreeNode(shogi, 0, jkf.moves);
  //fillSFEN(kifuTree, jkf);
  return kifuTree;
}

export function createKifuTreeNode(shogi: Shogi, tesuu: number, moveFormats: MoveFormat[]): KifuTreeNode {
  const moveFormat = moveFormats[0];
  //console.log(tesuu, moveFormats);
  return new KifuTreeNode({
    tesuu: tesuu,
    comment: moveFormat.comments ? moveFormat.comments.join('\n') : '',
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

function moveFormatsToForks(moveFormats: MoveFormat[]): MoveFormat[][] {
  let forks: MoveFormat[][] = [];
  if (moveFormats.length >= 2) {
    forks.push(moveFormats.slice(1));
  }

  if (moveFormats[1] && moveFormats[1].forks) {
    forks = forks.concat(moveFormats[1].forks as MoveFormat[][]);
  }
  return forks;
}

export function buildJumpMap(kifuTree: KifuTreeNode): JumpMap {
  // const begin = new Date();
  const jumpMap = Map<SFEN, List<JumpTo>>().withMutations(jumpMap => {
    const seen: { [sfen: string]: JumpTo } = {};

    buildJumpMapFromNode(kifuTree, List<number>());

    function buildJumpMapFromNode(kifuTreeNode: KifuTreeNode, path: Path) {
      const sfen = kifuTreeNode.sfen;
      const jumpTo = new JumpTo({
        node: kifuTreeNode,
        path: path,
      });
      if (seen[sfen]) {
        if (!jumpMap.has(sfen)) {
          jumpMap.set(sfen, List<JumpTo>([seen[sfen]]));
        }
        jumpMap.set(sfen, jumpMap.get(sfen).push(jumpTo));
      } else {
        seen[sfen] = jumpTo;
      }

      kifuTreeNode.children.forEach((childNode: KifuTreeNode, i: number) => {
        buildJumpMapFromNode(childNode, path.push(i));
      });
    }

  });

  // const end = new Date();
  // console.log(`buildJumpMap: ${end.getTime() - begin.getTime()}ms`);
  // console.log(jumpMap);

  return jumpMap;
}

export function kifuTreeToJKF(kifuTree: KifuTreeNode, baseJKF: JSONKifuFormat): JSONKifuFormat {
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

function nodesToMoveFormats(nodes: KifuTreeNode[]): MoveFormat[] {
  const primaryNode = nodes[0];

  if (!primaryNode) {
    return [];
  }

  // key order is important for readability
  const primaryMoveFormat: MoveFormat = {
    comments: primaryNode.comment ? primaryNode.comment.split('\n') : undefined,
    move: primaryNode.move,
    time: primaryNode.time,
    special: primaryNode.special,
    forks: nodes.length >= 2 ? nodes.slice(1).map(childNode => nodesToMoveFormats([childNode]))
      : undefined,
  };

  return [primaryMoveFormat].concat(nodesToMoveFormats(primaryNode.children.toArray()));
}

export function getNodesOnPath(tree: KifuTreeNode, path: PathLike): KifuTreeNode[] {
  const nodes: KifuTreeNode[] = [];
  let currentNode = tree;
  path.forEach((num: number) => {
    currentNode = currentNode.children.get(num);
    nodes.push(currentNode);
  });

  return nodes;
}

export function getStringPath(tree: KifuTreeNode, path: Path): string[] {
  return getNodesOnPath(tree, path).map(node => node.readableKifu);
}

export function pathToKeyPath(path: PathLike): any[] {
  const keyPath: any[] = [];
  path.forEach(num => {
    keyPath.push('children');
    keyPath.push(num);
  });
  return keyPath;
}

export function findNodeByPath(tree: KifuTreeNode, path: PathLike): KifuTreeNode {
  if (path.size === 0) {
    return tree;
  }
  const nodes = getNodesOnPath(tree, path);
  return nodes[nodes.length - 1];
}

export function getPreviousForkPath(tree: KifuTreeNode, path: Path): Path {
  const nodes = getNodesOnPath(tree, path);
  for (let i = nodes.length - 2; i >= 0; i--) {
    const node = nodes[i];
    if (node.children.size >= 2) {
      return path.slice(0, i + 1) as Path;
    }
  }
  return List<number>();
}

export function getNextForkPath(tree: KifuTreeNode, path: Path): Path {
  let currentNode = findNodeByPath(tree, path);
  if (currentNode.children.size === 0) {
    return path;
  }

  let newPath = path;
  while (true) {
    currentNode = currentNode.children.get(0);
    newPath = newPath.push(0);
    if (currentNode.children.size !== 1) {
      return newPath;
    }
  }
}
