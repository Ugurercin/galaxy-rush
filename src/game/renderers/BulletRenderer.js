// BulletRenderer — draws all bullet types
// Edit freely to change how bullets look
//
// ── Tune these ───────────────────────────────────────────

const BulletRenderer = {

  // ── Player bullets — neon yellow streaks + rockets ─────
  drawPlayerBullets(g, bullets) {
    g.clear();
    bullets.forEach(b => {
      if (b.isRocket) {
        this._drawRocket(g, b);
      } else {
        this._drawBullet(g, b);
      }
    });
  },

  _drawBullet(g, b) {
    // Outer glow
    g.fillStyle(0xffe066, 0.25);
    g.fillRect(b.x - 3, b.y - 6, 6, 16);
    // Core streak
    g.fillStyle(0xffe066, 1);
    g.fillRect(b.x - 2, b.y - 5, 4, 14);
    // Bright tip
    g.fillStyle(0xffffff, 0.9);
    g.fillRect(b.x - 1, b.y - 5, 2, 4);
  },

  _drawRocket(g, b) {
    // Rocket body
    g.fillStyle(0xff9900, 1);
    g.fillRect(b.x - 4, b.y - 10, 8, 18);

    // Nose cone
    g.fillStyle(0xffcc44, 1);
    g.fillTriangle(b.x, b.y - 14, b.x - 4, b.y - 10, b.x + 4, b.y - 10);

    // Tail fins
    g.fillStyle(0xff6600, 0.9);
    g.fillTriangle(b.x - 4, b.y + 8, b.x - 8, b.y + 14, b.x - 4, b.y + 14);
    g.fillTriangle(b.x + 4, b.y + 8, b.x + 8, b.y + 14, b.x + 4, b.y + 14);

    // Engine flame
    g.fillStyle(0xffee44, 0.9);
    g.fillCircle(b.x, b.y + 10, 4);
    g.fillStyle(0xff6600, 0.6);
    g.fillCircle(b.x, b.y + 14, 3);

    // Outer glow
    g.fillStyle(0xff9900, 0.15);
    g.fillCircle(b.x, b.y, 14);
  },

  // ── Enemy bullets — orange orbs ────────────────────────
  drawEnemyBullets(g, bullets) {
    g.clear();
    bullets.forEach(b => {
      g.fillStyle(0xff6600, 0.3);  g.fillCircle(b.x, b.y, 6);
      g.fillStyle(0xff9900, 1);    g.fillCircle(b.x, b.y, 3.5);
      g.fillStyle(0xffcc44, 0.9);  g.fillCircle(b.x, b.y, 1.5);
    });
  },
};