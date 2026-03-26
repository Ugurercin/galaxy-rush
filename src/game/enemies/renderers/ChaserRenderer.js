// ChaserRenderer — controls how the Chaser looks
// Edit freely without touching game logic
//
// ── Tune these ───────────────────────────────────────────

const ChaserRenderer = {
  draw(g, e) {
    const { x, y, size: s, color } = e;

    // ── Arrow body pointing down ───────────────────────────
    g.fillStyle(color, 0.9);
    g.fillTriangle(
      x,      y + s,
      x - s,  y - s * 0.6,
      x + s,  y - s * 0.6
    );

    // ── Speed lines — shows movement direction ─────────────
    g.lineStyle(0.8, 0xdd88ff, 0.5);
    g.lineBetween(x - s * 0.3, y - s * 0.6, x - s * 0.3, y - s * 1.1);
    g.lineBetween(x + s * 0.3, y - s * 0.6, x + s * 0.3, y - s * 1.1);
    g.lineBetween(x,            y - s * 0.6, x,            y - s * 1.2);

    // ── Outline ───────────────────────────────────────────
    g.lineStyle(1, 0xee88ff, 0.8);
    g.strokeTriangle(
      x,      y + s,
      x - s,  y - s * 0.6,
      x + s,  y - s * 0.6
    );

    // ── Core ──────────────────────────────────────────────
    g.fillStyle(0xee88ff, 0.9);
    g.fillCircle(x, y, s * 0.2);

    // ── HP bar ────────────────────────────────────────────
    e.drawHPBar(g);
  },
};