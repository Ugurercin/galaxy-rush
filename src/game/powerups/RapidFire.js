const RapidFire = {
  type:     'rapidfire',
  color:    0x00e5ff,
  label:    'RAPID FIRE',
  duration: 8000,

  apply(scene) {
    scene.fireRate = 180;
  },

  remove(scene) {
    scene.fireRate = 500;
  },

  drawOrb(g, orb) {
    g.fillStyle(0x00e5ff, 0.2);
    g.fillCircle(orb.x, orb.y, 12);
    g.fillStyle(0x00e5ff, 0.9);
    g.fillTriangle(orb.x, orb.y - 8, orb.x - 7, orb.y, orb.x + 7, orb.y);
    g.fillTriangle(orb.x, orb.y + 8, orb.x - 7, orb.y, orb.x + 7, orb.y);
    g.fillStyle(0xffffff, 0.8);
    g.fillCircle(orb.x, orb.y, 2);
  },
};