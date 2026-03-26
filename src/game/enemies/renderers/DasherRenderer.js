const DasherRenderer = {
  draw(g, e) {
    const { x, y, size: s, color, state } = e;

    g.fillStyle(color, 0.9);
    g.fillTriangle(
      x,         y + s,
      x - s,     y - s * 0.4,
      x + s,     y - s * 0.4
    );

    if (state === 'charge') {
      g.lineStyle(1, 0xfff2aa, 0.9);
      g.lineBetween(x - s * 1.2, y, x - s * 0.4, y);
      g.lineBetween(x + s * 1.2, y, x + s * 0.4, y);
    }

    if (state === 'dash') {
      g.lineStyle(1, 0xffee88, 0.55);
      g.lineBetween(x, y - s * 0.6, x - e.dashDir * s * 1.1, y - s * 0.4);
      g.lineBetween(x, y,           x - e.dashDir * s * 1.4, y);
      g.lineBetween(x, y + s * 0.5, x - e.dashDir * s * 1.1, y + s * 0.3);
    }

    g.lineStyle(0.8, 0xfff0a0, 0.8);
    g.strokeTriangle(
      x,         y + s,
      x - s,     y - s * 0.4,
      x + s,     y - s * 0.4
    );

    g.fillStyle(0xffffcc, 0.85);
    g.fillCircle(x, y, s * 0.18);

    e.drawHPBar(g);
  },
};