// ShooterRenderer — controls how the Shooter looks
// Edit freely without touching game logic
//
// ── Tune these ───────────────────────────────────────────

const ShooterRenderer = {
  draw(g, e) {
    const { x, y, size: s, color } = e;

    // ── Hexagonal body ────────────────────────────────────
    g.fillStyle(color, 0.85);
    g.fillRect(x - s * 0.7, y - s * 0.5, s * 1.4, s);

    // ── Cannon barrel ─────────────────────────────────────
    g.fillStyle(0xffaa00, 1);
    g.fillRect(x - 3, y + s * 0.4, 6, s * 0.7);

    // ── Side vents ────────────────────────────────────────
    g.fillStyle(0xffcc44, 0.5);
    g.fillRect(x - s * 0.7, y - s * 0.5, 4, s);
    g.fillRect(x + s * 0.7 - 4, y - s * 0.5, 4, s);

    // ── Outline ───────────────────────────────────────────
    g.lineStyle(1, 0xffcc44, 0.8);
    g.strokeRect(x - s * 0.7, y - s * 0.5, s * 1.4, s);

    // ── Core glow ─────────────────────────────────────────
    g.fillStyle(0xffdd88, 0.9);
    g.fillCircle(x, y, s * 0.25);

    // ── HP bar ────────────────────────────────────────────
    e.drawHPBar(g);
  },
};