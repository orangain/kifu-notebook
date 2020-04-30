import { List } from "immutable";

import { Path } from "../types";
import { KifuTreeNode } from "../kifuTreeNode";
import { JumpTo, JumpMap } from "../jumpTo";

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
      const node = currentNode.node.children.get(i)!;
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

export function getNodesOnPath(tree: KifuTreeNode, path: Path): KifuTreeNode[] {
  const nodes: KifuTreeNode[] = [];
  let currentNode = tree;
  path.forEach((num) => {
    currentNode = currentNode.children.get(num)!;
    nodes.push(currentNode);
  });

  return nodes;
}

export function getStringPathFromPath(tree: KifuTreeNode, path: Path): string[] {
  return getNodesOnPath(tree, path).map((node) => node.readableKifu);
}

export function getPathFromStringPath(tree: KifuTreeNode, stringPath: string[]): Path {
  const path: number[] = [];
  let currentNode = tree;
  for (let kifu of stringPath) {
    const nextNodeIndex = currentNode.children.findIndex(
      (childNode) => childNode.readableKifu === kifu
    );
    if (nextNodeIndex < 0) {
      break; // stop if node is missing (e.g. node is removed)
    }
    const nextNode = currentNode.children.get(nextNodeIndex)!;

    path.push(nextNodeIndex);
    currentNode = nextNode;
  }

  return List(path);
}

export function pathToKeyPath(path: Path): (string | number)[] {
  const keyPath: (string | number)[] = [];
  path.forEach((num) => {
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
