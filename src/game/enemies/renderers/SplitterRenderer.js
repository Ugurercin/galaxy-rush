// SplitterRenderer — controls how the Splitter looks
// Edit freely without touching game logic
//
// ── Tune these ───────────────────────────────────────────

const SplitterRenderer = {
  draw(g, e) {
    const { x, y, size: s, color } = e;

    // ── Diamond top half ──────────────────────────────────
    g.fillStyle(color, 0.85);
    g.fillTriangle(x, y - s, x - s, y, x + s, y);

    // ── Diamond bottom half ───────────────────────────────
    g.fillTriangle(x, y + s, x - s, y, x + s, y);

    // ── Inner diamond highlight ───────────────────────────
    g.fillStyle(0x88eeff, 0.6);
    g.fillTriangle(x, y - s * 0.5, x - s * 0.5, y, x + s * 0.5, y);

    // ── Outline ───────────────────────────────────────────
    g.lineStyle(1, 0x44ddff, 0.9);
    g.strokeTriangle(x, y - s, x - s, y, x + s, y);
    g.strokeTriangle(x, y + s, x - s, y, x + s, y);

    // ── Split hint — horizontal seam ──────────────────────
    g.lineStyle(0.5, 0xffffff, 0.3);
    g.lineBetween(x - s, y, x + s, y);

    // ── HP bar ────────────────────────────────────────────
    e.drawHPBar(g);
  },
};