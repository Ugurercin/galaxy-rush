const SpreadShot = {
  type:     'spreadshot',
  color:    0xe040fb,
  label:    'SPREAD SHOT',
  duration: 10000,

  apply(scene) {
    scene.spreadShot = true;
  },

  remove(scene) {
    scene.spreadShot = false;
  },

  drawOrb(g, orb) {
    g.fillStyle(0xe040fb, 0.2);
    g.fillCircle(orb.x, orb.y, 12);
    g.fillStyle(0xe040fb, 0.9);
    // Three bullet lines fanning out
    g.fillRect(orb.x - 1.5, orb.y - 8, 3, 10);
    g.fillRect(orb.x - 7,   orb.y - 5, 3, 9);
    g.fillRect(orb.x + 4,   orb.y - 5, 3, 9);
    g.fillStyle(0xffffff, 0.8);
    g.fillCircle(orb.x, orb.y + 4, 2);
  },
};