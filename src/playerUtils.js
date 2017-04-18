import JKFPlayer from "json-kifu-format";

export function buildJKFPlayerFromState(state) {
  const { jkf, currentPathArray } = state;
  const player = new JKFPlayer(jkf);
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
