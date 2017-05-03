import { Record, Map, List } from 'immutable';
import * as Immutable from 'immutable';

import {
  KifuTreeNode, Path, JumpTo, JumpTarget, jkfToKifuTree, kifuTreeToJKF, pathToKeyPath,
  findNodeByPath, getNodesOnPath, getStringPath, getPathFromStringPath,
  createKifuTreeNode, buildJumpMap, traverseTree
} from "./treeUtils";
import { JSONKifuFormat, MoveMoveFormat, JKFPlayer } from "./shogiUtils";

export { KifuTreeNode, Path, JumpTo, JumpTarget }; // for convenience

export class KifuTree extends Record({
  rootNode: null,
  baseJKF: null,
  currentPath: List<number>(),
}) {
  readonly rootNode: KifuTreeNode;
  readonly baseJKF: JSONKifuFormat;
  readonly currentPath: Path;

  static fromJKF(jkf: JSONKifuFormat): KifuTree {
    const rootNode = jkfToKifuTree(jkf);
    const baseJKF = Object.assign({}, jkf, { moves: [jkf.moves[0]] });
    return new KifuTree({ rootNode, baseJKF }).maintainJumpTargets();
  }

  toJKF(): JSONKifuFormat {
    return kifuTreeToJKF(this.rootNode, this.baseJKF);
  }

  setCurrentPath(path: Path): KifuTree {
    return this.set('currentPath', path) as KifuTree;
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
      currentNode = currentNode.children.get(0);
      newPath = newPath.concat([0]);
      if (currentNode.children.size !== 1) {
        return newPath;
      }
    }
  }

  updateNode(path: Path, nodeUpdater: (node: KifuTreeNode) => KifuTreeNode | Map<string, any>): KifuTree {
    const keyPath = pathToKeyPath(path);
    const newRootNode = this.rootNode.updateIn(keyPath, (node: KifuTreeNode) => nodeUpdater(node)) as KifuTreeNode;
    return (this.set('rootNode', newRootNode) as KifuTree).maintainJumpTargets();
  }

  updateFork(path: Path, forkUpdater: (children: List<KifuTreeNode>, lastIndex: number) => List<KifuTreeNode>): KifuTree {
    const currentStringPath = getStringPath(this.rootNode, this.currentPath);
    let newKifuTree = this.updateForkOfKifuTree(path, forkUpdater);
    if (newKifuTree === this) {
      return this; // no change
    }

    const newPath = getPathFromStringPath(newKifuTree.rootNode, currentStringPath);
    return newKifuTree.setCurrentPath(newPath);
  }

  private updateForkOfKifuTree(path: Path, forkUpdater: (children: List<KifuTreeNode>, lastIndex: number) => List<KifuTreeNode>): KifuTree {
    const lastIndex = path.get(path.size - 1);
    const parentPath = path.slice(0, -1);
    const newKifuTree = this.updateNode(parentPath, (node: KifuTreeNode) => {
      return node.update('children', (children: List<KifuTreeNode>) => {
        return forkUpdater(children, lastIndex);
      });
    });
    if (newKifuTree === this) {
      return this; // no change
    }
    return newKifuTree.maintainJumpTargets();
  }

  movePiece(move: MoveMoveFormat): KifuTree | false {
    // 1. Compare with existing nodes
    const currentNode = this.getCurrentNode();
    const childIndex = currentNode.children.findIndex((childNode: KifuTreeNode): boolean => JKFPlayer.sameMoveMinimal(childNode.move, move));
    if (childIndex >= 0) {
      return this.setCurrentPath(this.currentPath.concat([childIndex])); // Proceed to existing node
    }

    // 2. Make player then input move
    const minimalMoveFormats = [{}].concat(this.getNodesOnPath(this.currentPath).map(node => ({ move: node.move })));
    const minimalJKF = Object.assign({}, this.baseJKF, { moves: minimalMoveFormats });
    const player = new JKFPlayer(minimalJKF);
    player.goto(minimalMoveFormats.length);

    if (!player.inputMove(move)) {
      return false;
    }

    // 3. Create new objects
    const newMoveFormat = player.kifu.moves[player.kifu.moves.length - 1]; // newMoveFormat is normalized
    const newNode = createKifuTreeNode(player.shogi, currentNode.tesuu + 1, [newMoveFormat]);
    return this
      .updateNode(this.currentPath, (node: KifuTreeNode) => {
        return node.update('children', children => {
          return children.push(newNode);
        });
      })
      .maintainJumpTargets()
      .setCurrentPath(this.currentPath.concat([currentNode.children.size]));
  }

  private maintainJumpTargets(): KifuTree {
    const begin = new Date();

    const jumpMap = buildJumpMap(this.rootNode);
    const newKifuTree = this.set('rootNode', this.rootNode.withMutations((rootNode: KifuTreeNode) => {
      traverseTree(this.rootNode, (node: KifuTreeNode, path: Path) => {
        const jumpToList = (jumpMap[node.sfen] || []).filter((jumpTo: JumpTo) => jumpTo.node !== node);
        const jumpTargets = List<JumpTarget>().withMutations(jumpTargets => {
          jumpToList.forEach((jumpTo: JumpTo) => {
            jumpTo.node.children.forEach((jumpTargetNode: KifuTreeNode, i: number) => {
              jumpTargets.push(new JumpTarget({
                path: jumpTo.path.concat(i),
                comment: jumpTargetNode.comment,
                readableKifu: jumpTargetNode.readableKifu,
              }));
            });
          });
        });

        if (!Immutable.is(node.jumpTargets, jumpTargets)) {
          rootNode.setIn(pathToKeyPath(path).concat('jumpTargets'), jumpTargets);
        }
      });
    })) as KifuTree;

    const end = new Date();
    console.log(`maintainJumpTargets: ${end.getTime() - begin.getTime()}ms`);
    return newKifuTree;
  }
}

export type KifuNotebookState = AppState & BoardSetState & CurrentNodeState & KifuTreeState;

export interface AppState {
  message: string;
  autoSaveEnabled: boolean;
  needSave: boolean;
}

export interface BoardSetState {
  kifuTree: KifuTree;
  reversed: boolean;
}

export interface CurrentNodeState {
  kifuTree: KifuTree;
}

export interface KifuTreeState {
  kifuTree: KifuTree;
}
