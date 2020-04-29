import Immutable, { Record, List } from "immutable";
import { JKFPlayer } from "json-kifu-format";
import { IJSONKifuFormat, IMoveMoveFormat, IPlaceFormat } from "json-kifu-format/dist/src/Formats";

import { KifuTreeNode } from "./kifuTreeNode";
import { JumpTarget } from "./jumpTarget";
import { Path } from "./path";
import {
  findNodeByPath,
  getNodesOnPath,
  pathToKeyPath,
  getStringPathFromPath,
  getPathFromStringPath,
  buildJumpMap,
  traverseTree,
} from "./utils/treeUtils";
import { jkfToKifuTree, createKifuTreeNode } from "./utils/treeBuilder";
import { kifuTreeToJKF } from "./utils/treeSerializer";

export interface IKifuTree {
  readonly rootNode: KifuTreeNode;
  readonly baseJKF: IJSONKifuFormat;
  readonly currentPath: Path;
}

export class KifuTree extends Record<IKifuTree>({
  rootNode: null!,
  baseJKF: null!,
  currentPath: List<number>(),
}) {
  constructor(props: Partial<IKifuTree>) {
    if (!props.rootNode) throw new Error("KifuTree.rootNode is mandatory");
    if (!props.baseJKF) throw new Error("KifuTree.baseJKF is mandatory");
    super(props);
  }

  static fromJKF(jkf: IJSONKifuFormat): KifuTree {
    const rootNode = jkfToKifuTree(jkf);
    const baseJKF = { ...jkf, moves: [jkf.moves[0]] };
    return new KifuTree({ rootNode, baseJKF }).maintainJumpTargets();
  }

  toJKF(): IJSONKifuFormat {
    return kifuTreeToJKF(this.rootNode, this.baseJKF);
  }

  setCurrentPath(path: Path): KifuTree {
    return this.set("currentPath", path);
  }

  getCurrentNode(): KifuTreeNode {
    return this.getNodeByPath(this.currentPath);
  }

  getNodeByPath(path: Path): KifuTreeNode {
    return findNodeByPath(this.rootNode, path);
  }

  getNodesOnPath(path: Path): KifuTreeNode[] {
    return getNodesOnPath(this.rootNode, path);
  }

  getPreviousPath(): Path {
    const path = this.currentPath;
    return path.size > 0 ? path.slice(0, path.size - 1) : path;
  }

  getNextPath(): Path {
    const path = this.currentPath;
    const node = this.getNodeByPath(path);
    return node.children.size > 0 ? path.concat([0]) : path;
  }

  getPreviousForkPath(): Path {
    const path = this.currentPath;
    const nodes = this.getNodesOnPath(path);
    for (let i = nodes.length - 2; i >= 0; i--) {
      const node = nodes[i];
      if (node.children.size >= 2) {
        return path.slice(0, i + 1);
      }
    }
    return List<number>();
  }

  getNextForkPath(): Path {
    const path = this.currentPath;
    let currentNode = this.getNodeByPath(path);
    if (currentNode.children.size === 0) {
      return path;
    }

    let newPath = path;
    while (true) {
      currentNode = currentNode.children.get(0)!;
      newPath = newPath.concat([0]);
      if (currentNode.children.size !== 1) {
        return newPath;
      }
    }
  }

  updateNode(
    path: Path,
    nodeUpdater: (node: KifuTreeNode) => KifuTreeNode,
    skipMaintainJumpTargets = false // TODO: Change method or detect automatically
  ): KifuTree {
    const keyPath = pathToKeyPath(path);
    const newRootNode = this.rootNode.updateIn(keyPath, (node) => nodeUpdater(node));
    const newTree = this.set("rootNode", newRootNode);

    return skipMaintainJumpTargets ? newTree : newTree.maintainJumpTargets();
  }

  updateFork(
    path: Path,
    forkUpdater: (children: List<KifuTreeNode>, lastIndex: number) => List<KifuTreeNode>
  ): KifuTree {
    const currentStringPath = getStringPathFromPath(this.rootNode, this.currentPath);
    let newKifuTree = this.updateForkOfKifuTree(path, forkUpdater);
    if (newKifuTree === this) {
      return this; // no change
    }

    const newPath = getPathFromStringPath(newKifuTree.rootNode, currentStringPath);
    return newKifuTree.setCurrentPath(newPath);
  }

  private updateForkOfKifuTree(
    path: Path,
    forkUpdater: (children: List<KifuTreeNode>, lastIndex: number) => List<KifuTreeNode>
  ): KifuTree {
    const lastIndex = path.get(path.size - 1)!;
    const parentPath = path.slice(0, -1);
    const newKifuTree = this.updateNode(parentPath, (node) =>
      node.update("children", (children) => forkUpdater(children, lastIndex))
    );
    if (newKifuTree === this) {
      return this; // no change
    }
    return newKifuTree.maintainJumpTargets();
  }

  movePiece(move: IMoveMoveFormat): KifuTree | false {
    // 1. Compare with existing nodes
    const currentNode = this.getCurrentNode();
    const childIndex = currentNode.children.findIndex((childNode) =>
      isSameMove(childNode.move!, move)
    );
    if (childIndex >= 0) {
      return this.setCurrentPath(this.currentPath.concat([childIndex])); // Proceed to existing node
    }

    // 2. Make player then input move
    const minimalMoveFormats = [
      {},
      ...this.getNodesOnPath(this.currentPath).map((node) => ({ move: node.move })),
    ];
    const minimalJKF = { ...this.baseJKF, moves: minimalMoveFormats };
    const player = new JKFPlayer(minimalJKF);
    player.goto(minimalMoveFormats.length);

    if (!player.inputMove(move)) {
      return false;
    }

    // 3. Create new objects
    const newMoveFormat = player.kifu.moves[player.kifu.moves.length - 1]; // newMoveFormat is normalized
    const newNode = createKifuTreeNode(player.shogi, currentNode.tesuu + 1, [newMoveFormat]);
    return this.updateNode(this.currentPath, (node) => {
      return node.update("children", (children) => {
        return children.push(newNode);
      });
    })
      .maintainJumpTargets()
      .setCurrentPath(this.currentPath.concat([currentNode.children.size]));
  }

  private maintainJumpTargets(): KifuTree {
    const begin = new Date();

    const jumpMap = buildJumpMap(this.rootNode);
    const newKifuTree = this.set(
      "rootNode",
      this.rootNode.withMutations((rootNode) => {
        traverseTree(this.rootNode, (node, path) => {
          const jumpToList = (jumpMap[node.sfen] || []).filter((jumpTo) => jumpTo.node !== node);
          const jumpTargets = List<JumpTarget>().withMutations((jumpTargets) => {
            jumpToList.forEach((jumpTo) => {
              jumpTo.node.children.forEach((jumpTargetNode, i) => {
                jumpTargets.push(
                  new JumpTarget({
                    path: jumpTo.path.concat(i),
                    comment: jumpTargetNode.comment,
                    readableKifu: jumpTargetNode.readableKifu,
                  })
                );
              });
            });
          });

          if (!Immutable.is(node.jumpTargets, jumpTargets)) {
            rootNode.setIn([...pathToKeyPath(path), "jumpTargets"], jumpTargets);
          }
        });
      })
    );

    const end = new Date();
    console.log(`maintainJumpTargets: ${end.getTime() - begin.getTime()}ms`);
    return newKifuTree;
  }
}

function isSameMove(a: IMoveMoveFormat, b: IMoveMoveFormat): boolean {
  if (a.from && b.from) {
    // Compare moves
    return isSamePlace(a.to!, b.to!) && isSamePlace(a.from, b.from) && a.promote === b.promote;
  } else if (!a.from && !b.from) {
    // Compare drops
    return isSamePlace(a.to!, b.to!) && a.piece === b.piece;
  } else {
    return false;
  }
}

function isSamePlace(a: IPlaceFormat, b: IPlaceFormat): boolean {
  return a.x === b.x && a.y === b.y;
}
