const ZigZagRenderer = {
  draw(g, e) {
    const { x, y, size: s, color } = e;

    g.fillStyle(color, 0.9);
    g.fillTriangle(
      x,         y + s,
      x - s,     y - s * 0.5,
      x + s,     y - s * 0.5
    );

    g.fillStyle(0xaaffcc, 0.7);
    g.fillTriangle(
      x,         y - s * 0.2,
      x - s * 0.5, y + s * 0.6,
      x + s * 0.5, y + s * 0.6
    );

    g.lineStyle(1, 0xc8ffda, 0.7);
    g.lineBetween(x - s * 0.8, y - s * 0.7, x - s * 0.25, y - s * 0.1);
    g.lineBetween(x + s * 0.8, y - s * 0.7, x + s * 0.25, y - s * 0.1);

    g.lineStyle(0.8, 0xd8ffe8, 0.8);
    g.strokeTriangle(
      x,         y + s,
      x - s,     y - s * 0.5,
      x + s,     y - s * 0.5
    );
  },
};