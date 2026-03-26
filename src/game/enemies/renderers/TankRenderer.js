const TankRenderer = {
  draw(g, e) {
    const { x, y, size: s, color } = e;

    g.fillStyle(color, 0.9);
    g.fillRect(x - s, y - s * 0.6, s * 2, s * 1.2);

    g.fillStyle(0xaab5ff, 0.7);
    g.fillRect(x - s * 0.55, y - s * 0.35, s * 1.1, s * 0.7);

    g.fillStyle(0x5a6cff, 0.9);
    g.fillRect(x - 4, y + s * 0.2, 8, s * 0.8);

    g.fillStyle(0xdde3ff, 0.5);
    g.fillRect(x - s * 0.85, y - s * 0.45, s * 0.18, s * 0.9);
    g.fillRect(x + s * 0.67, y - s * 0.45, s * 0.18, s * 0.9);

    g.lineStyle(1, 0xcfd6ff, 0.85);
    g.strokeRect(x - s, y - s * 0.6, s * 2, s * 1.2);

    e.drawHPBar(g);
  },
};