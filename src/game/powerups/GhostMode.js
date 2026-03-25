const GhostMode = {
  type:     'ghostmode',
  color:    0xce93d8,
  label:    'GHOST MODE',
  duration: 5000,

  apply(scene) {
    scene.ghostMode      = true;
    scene.invincible     = true;
    scene.coinMultiplier = 2;
  },

  remove(scene) {
    scene.ghostMode      = false;
    scene.invincible     = false;
    scene.coinMultiplier = 1;
  },

  drawOrb(g, orb) {
    g.fillStyle(0xce93d8, 0.2);
    g.fillCircle(orb.x, orb.y, 12);
    g.fillStyle(0xce93d8, 0.85);
    // Ghost shape — dome top, wavy bottom
    g.fillCircle(orb.x, orb.y - 2, 7);
    g.fillRect(orb.x - 7, orb.y - 2, 14, 7);
    // Wavy bottom
    g.fillStyle(0x060a12, 1);
    g.fillTriangle(orb.x - 7, orb.y + 5, orb.x - 4, orb.y + 2, orb.x - 1, orb.y + 5);
    g.fillTriangle(orb.x - 1, orb.y + 5, orb.x + 2,  orb.y + 2, orb.x + 5,  orb.y + 5);
    // Eyes
    g.fillStyle(0xffffff, 1);
    g.fillCircle(orb.x - 2.5, orb.y - 3, 2);
    g.fillCircle(orb.x + 2.5, orb.y - 3, 2);
  },
};