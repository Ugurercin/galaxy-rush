// BulletRenderer — draws all bullet types
// Edit freely to change how bullets look
//
// ── Tune these ───────────────────────────────────────────

const BulletRenderer = {

  // ── Player bullets — neon yellow streaks ───────────────
  drawPlayerBullets(g, bullets) {
    g.clear();
    bullets.forEach(b => {
      // Outer glow
      g.fillStyle(0xffe066, 0.25);
      g.fillRect(b.x - 3, b.y - 6, 6, 16);

      // Core streak
      g.fillStyle(0xffe066, 1);
      g.fillRect(b.x - 2, b.y - 5, 4, 14);

      // Bright tip
      g.fillStyle(0xffffff, 0.9);
      g.fillRect(b.x - 1, b.y - 5, 2, 4);
    });
  },

  // ── Enemy bullets — orange orbs ────────────────────────
  drawEnemyBullets(g, bullets) {
    g.clear();
    bullets.forEach(b => {
      // Outer glow
      g.fillStyle(0xff6600, 0.3);
      g.fillCircle(b.x, b.y, 6);

      // Core
      g.fillStyle(0xff9900, 1);
      g.fillCircle(b.x, b.y, 3.5);

      // Bright center
      g.fillStyle(0xffcc44, 0.9);
      g.fillCircle(b.x, b.y, 1.5);
    });
  },
};