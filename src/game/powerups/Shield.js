const Shield = {
  type:     'shield',
  color:    0x69ff47,
  label:    'SHIELD',
  duration: -1, // -1 means until consumed by a hit

  apply(scene) {
    scene.hasShield = true;
  },

  remove(scene) {
    scene.hasShield = false;
  },

  drawOrb(g, orb) {
    g.fillStyle(0x69ff47, 0.2);
    g.fillCircle(orb.x, orb.y, 12);
    g.lineStyle(2, 0x69ff47, 0.9);
    g.strokeCircle(orb.x, orb.y, 7);
    g.fillStyle(0x69ff47, 0.5);
    g.fillCircle(orb.x, orb.y, 4);
    g.fillStyle(0xffffff, 0.8);
    g.fillCircle(orb.x, orb.y, 1.5);
  },
};