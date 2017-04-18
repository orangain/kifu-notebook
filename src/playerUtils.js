import JKFPlayer from "json-kifu-format";

import { kifuTreeToJKF } from './treeUtils';

export function buildJKFPlayerFromState(state) {
  const { kifuTree, baseJKF, currentPathArray } = state;
  const player = new JKFPlayer(kifuTreeToJKF(kifuTree, baseJKF));
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
