const BomberRenderer = {
  draw(g, e) {
    const { x, y, size: s, color } = e;

    g.fillStyle(color, 0.88);
    g.fillTriangle(
      x,             y + s,
      x - s * 0.9,   y - s * 0.2,
      x + s * 0.9,   y - s * 0.2
    );

    g.fillStyle(0xffaa88, 0.65);
    g.fillRect(x - s * 0.75, y - s * 0.05, s * 1.5, s * 0.32);

    g.fillStyle(0xffddcc, 0.85);
    g.fillCircle(x, y + s * 0.1, s * 0.2);

    g.lineStyle(0.8, 0xffc0aa, 0.8);
    g.strokeTriangle(
      x,             y + s,
      x - s * 0.9,   y - s * 0.2,
      x + s * 0.9,   y - s * 0.2
    );

    e.drawHPBar(g);
  },
};