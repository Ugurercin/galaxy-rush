// DrifterRenderer — controls how the Drifter looks
// Edit freely without touching game logic
//
// ── Tune these ───────────────────────────────────────────
// Colors, shapes, sizes are all here
// e.x, e.y, e.size, e.color are passed in from the enemy

const DrifterRenderer = {
  draw(g, e) {
    const { x, y, size: s, color } = e;

    // ── Main body — downward pointing triangle ─────────────
    g.fillStyle(color, 0.9);
    g.fillTriangle(
      x,      y + s,
      x - s,  y - s * 0.5,
      x + s,  y - s * 0.5
    );

    // ── Wings ─────────────────────────────────────────────
    g.fillStyle(color, 0.55);
    g.fillTriangle(
      x - s * 0.3, y + s * 0.2,
      x - s * 1.1, y + s * 0.8,
      x - s * 0.2, y + s * 0.9
    );
    g.fillTriangle(
      x + s * 0.3, y + s * 0.2,
      x + s * 1.1, y + s * 0.8,
      x + s * 0.2, y + s * 0.9
    );

    // ── Outline ───────────────────────────────────────────
    g.lineStyle(0.8, 0xff6680, 0.7);
    g.strokeTriangle(
      x,      y + s,
      x - s,  y - s * 0.5,
      x + s,  y - s * 0.5
    );

    // ── Core glow ─────────────────────────────────────────
    g.fillStyle(0xff8899, 0.8);
    g.fillCircle(x, y + s * 0.1, s * 0.22);
  },
};