const ScreenBomb = {
  type:     'screenbomb',
  color:    0xff6d00,
  label:    'SCREEN BOMB',
  duration: -1, // instant use on collect

  apply(scene) {
    // Kill all loose enemies immediately
    scene.enemies.forEach(e => {
      scene.spawnExplosion(e.x, e.y, e.color);
      const pts = { drifter: 5, shooter: 10, chaser: 12, splitter: 15 };
      const p = pts[e.type] || 5;
      scene.score += p;
      scene.coins += p;
    });
    scene.enemies = [];

    // Kill all formation ships
    if (scene.formation && scene.formation.isActive()) {
      scene.formation.ships.forEach(s => {
        if (s.alive) {
          scene.spawnExplosion(s.x, s.y, 0x4488ff);
          scene.score += 10;
          scene.coins += 10;
        }
        s.alive = false;
      });
    }

    scene.scoreTxt.setText('SCORE  ' + scene.score);
    scene.coinTxt.setText('COINS  ' + scene.coins);

    // Flash the screen white briefly
    const flash = scene.add.rectangle(0, 0, scene.scale.width, scene.scale.height, 0xffffff)
      .setOrigin(0)
      .setAlpha(0.6)
      .setDepth(20);
    scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 400,
      onComplete: () => flash.destroy(),
    });
  },

  remove(scene) {
    // instant — nothing to remove
  },

  drawOrb(g, orb) {
    g.fillStyle(0xff6d00, 0.2);
    g.fillCircle(orb.x, orb.y, 12);
    g.fillStyle(0xff6d00, 0.9);
    // Explosion star shape
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x2 = orb.x + Math.cos(angle) * 8;
      const y2 = orb.y + Math.sin(angle) * 8;
      g.fillRect(x2 - 1.5, y2 - 1.5, 3, 3);
    }
    g.fillStyle(0xffcc44, 1);
    g.fillCircle(orb.x, orb.y, 4);
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(orb.x, orb.y, 2);
  },
};