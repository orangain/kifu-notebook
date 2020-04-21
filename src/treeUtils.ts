import { JKFPlayer } from "json-kifu-format";
import {
  IJSONKifuFormat,
  IMoveFormat,
  IMoveMoveFormat,
  ITimeFormat,
} from "json-kifu-format/dist/src/Formats";
import { Shogi } from "shogi.js";
import { List, Record } from "immutable";

import { Path } from "./models";

export type SFEN = string;
export type JumpMap = { [sfen: string]: JumpTo[] };

export interface IKifuTreeNode {
  readonly tesuu: number;
  readonly comment?: string;
  readonly move?: IMoveMoveFormat;
  readonly time?: {
    now: ITimeFormat;
    total: ITimeFormat;
  };
  readonly special?: string;
  readonly readableKifu: string;
  readonly sfen: SFEN;
  readonly children: List<KifuTreeNode>;
  readonly jumpTargets: List<JumpTarget>;
}

export class KifuTreeNode extends Record<IKifuTreeNode>({
  tesuu: 0,
  comment: "",
  move: undefined,
  time: undefined,
  special: undefined,
  readableKifu: "",
  sfen: undefined,
  children: List(),
  jumpTargets: List(),
}) {
  isBad(): boolean {
    return !!this.comment && this.comment.startsWith("bad:");
  }
}

export interface IJumpTarget {
  readonly path: Path;
  readonly comment: string;
  readonly readableKifu: string;
}

export class JumpTarget extends Record<IJumpTarget>({
  path: null,
  comment: "",
  readableKifu: "",
}) {
  isBad(): boolean {
    return !!this.comment && this.comment.startsWith("bad:");
  }
}

export interface IJumpTo {
  readonly node: KifuTreeNode;
  readonly path: Path;
}

export class JumpTo extends Record<IJumpTo>({
  node: null,
  path: null,
}) {}

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
    readableKifu:
      tesuu === 0 ? "開始局面" : JKFPlayer.moveToReadableKifu(moveFormat),
    sfen: shogi.toSFENString(tesuu + 1),
    children: List(
      moveFormatsToForks(moveFormats).map((moveFormatsOfFork, i) => {
        JKFPlayer.doMove(shogi, moveFormatsOfFork[0].move!);
        const childNode = createKifuTreeNode(
          shogi,
          tesuu + 1,
          moveFormatsOfFork
        );
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
    forks = forks.concat(moveFormats[1].forks as IMoveFormat[][]);
  }
  return forks;
}

export function traverseTree(
  rootNode: KifuTreeNode,
  callback: (node: KifuTreeNode, path: Path) => void
): void {
  const stack: { path: Path; node: KifuTreeNode }[] = [];
  stack.push({ path: List<number>(), node: rootNode });

  while (true) {
    const currentNode = stack.pop();
    if (!currentNode) {
      break;
    }
    callback(currentNode.node, currentNode.path);

    for (let i = currentNode.node.children.size - 1; i >= 0; i--) {
      const node = currentNode.node.children.get(i);
      const path = currentNode.path.concat(i);
      stack.push({ node, path });
    }
  }
}

export function buildJumpMap(rootNode: KifuTreeNode): JumpMap {
  // const begin = new Date();
  const jumpMap: JumpMap = {};
  const seen: { [sfen: string]: JumpTo } = {};

  traverseTree(rootNode, (node: KifuTreeNode, path: Path) => {
    const sfen = node.sfen;
    const jumpTo = new JumpTo({
      node: node,
      path: path,
    });
    if (seen[sfen]) {
      if (!jumpMap[sfen]) {
        jumpMap[sfen] = [seen[sfen]];
      }
      jumpMap[sfen].push(jumpTo);
    } else {
      seen[sfen] = jumpTo;
    }
  });

  // const end = new Date();
  // console.log(`buildJumpMap: ${end.getTime() - begin.getTime()}ms`);
  // console.log(jumpMap);

  return jumpMap;
}

export function kifuTreeToJKF(
  kifuTree: KifuTreeNode,
  baseJKF: IJSONKifuFormat
): IJSONKifuFormat {
  const firstMove = Object.assign({}, baseJKF.moves[0]);
  firstMove.comments = kifuTree.comment
    ? kifuTree.comment.split("\n")
    : undefined;

  // key order is important for readability
  const newJKF = {
    header: baseJKF.header,
    initial: baseJKF.initial,
    moves: [firstMove].concat(nodesToMoveFormats(kifuTree.children.toArray())),
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

  return [primaryMoveFormat].concat(
    nodesToMoveFormats(primaryNode.children.toArray())
  );
}

export function getNodesOnPath(tree: KifuTreeNode, path: Path): KifuTreeNode[] {
  const nodes: KifuTreeNode[] = [];
  let currentNode = tree;
  path.forEach((num: number) => {
    currentNode = currentNode.children.get(num);
    nodes.push(currentNode);
  });

  return nodes;
}

export function getStringPathFromPath(
  tree: KifuTreeNode,
  path: Path
): string[] {
  return getNodesOnPath(tree, path).map((node) => node.readableKifu);
}

export function getPathFromStringPath(
  tree: KifuTreeNode,
  stringPath: string[]
): Path {
  const path: number[] = [];
  let currentNode = tree;
  for (let kifu of stringPath) {
    const nextNodeIndex = currentNode.children.findIndex(
      (childNode: KifuTreeNode): boolean => childNode.readableKifu === kifu
    );
    if (nextNodeIndex < 0) {
      break; // stop if node is missing (e.g. node is removed)
    }
    const nextNode = currentNode.children.get(nextNodeIndex);

    path.push(nextNodeIndex);
    currentNode = nextNode;
  }

  return List(path);
}

export function pathToKeyPath(path: Path): (string | number)[] {
  const keyPath: (string | number)[] = [];
  path.forEach((num: number) => {
    keyPath.push("children");
    keyPath.push(num);
  });
  return keyPath;
}

export function findNodeByPath(tree: KifuTreeNode, path: Path): KifuTreeNode {
  if (path.size === 0) {
    return tree;
  }
  const nodes = getNodesOnPath(tree, path);
  return nodes[nodes.length - 1];
}
