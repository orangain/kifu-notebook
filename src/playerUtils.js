import JKFPlayer from "json-kifu-format";

import { kifuTreeToJKF } from './treeUtils';

export function buildJKFPlayerFromState(state) {
  return buildJKFPlayer(state.kifuTree, state.baseJKF, state.currentPath);
}

export function buildJKFPlayer(kifuTree, baseJKF, currentPath) {
  const player = new JKFPlayer(kifuTreeToJKF(kifuTree, baseJKF));
  const currentPathArray = JSON.parse(currentPath);
  gotoPath(player, currentPathArray);

  return player;
}

function gotoPath(player, pathArray) {
  pathArray.forEach(num => {
    if (num === 0) {
      player.forward();
    } else {
      player.forkAndForward(num - 1);
    }
  });
}
