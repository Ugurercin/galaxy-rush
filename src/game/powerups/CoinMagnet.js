const CoinMagnet = {
  type:     'coinmagnet',
  color:    0xffeb3b,
  label:    'COIN MAGNET',
  duration: 12000,

  apply(scene) {
    scene.coinMagnet = true;
  },

  remove(scene) {
    scene.coinMagnet = false;
  },

  drawOrb(g, orb) {
    g.fillStyle(0xffeb3b, 0.2);
    g.fillCircle(orb.x, orb.y, 12);
    g.fillStyle(0xffeb3b, 0.9);
    // Magnet U-shape
    g.fillRect(orb.x - 6, orb.y - 6, 4, 10);
    g.fillRect(orb.x + 2,  orb.y - 6, 4, 10);
    g.fillRect(orb.x - 6, orb.y - 8, 12, 4);
    g.fillStyle(0xff3355, 0.9);
    g.fillRect(orb.x - 6, orb.y + 3, 4, 3);
    g.fillStyle(0x4488ff, 0.9);
    g.fillRect(orb.x + 2,  orb.y + 3, 4, 3);
  },
};