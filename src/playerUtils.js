import JKFPlayer from "json-kifu-format";

export function buildJKFPlayerFromState(state) {
  const { jkf, currentPath } = state;
  const player = new JKFPlayer(jkf);
  gotoPath(player, currentPath);

  return player;
}

function gotoPath(player, path) {
  path.forEach(num => {
    if (num === 0) {
      player.forward();
    } else {
      player.forkAndForward(num - 1);
    }
  });
}
