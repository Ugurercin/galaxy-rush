const OrbiterRenderer = {
  draw(g, e) {
    const { x, y, size: s, color, orbitT } = e;

    g.fillStyle(color, 0.18);
    g.fillCircle(x, y, s * 1.2);

    // outer ring
    g.lineStyle(2, 0xb7b0ff, 0.85);
    g.strokeCircle(x, y, s * 0.95);

    // body core
    g.fillStyle(color, 0.92);
    g.fillCircle(x, y, s * 0.55);

    // rotating nodes
    const r = s * 0.9;
    for (let i = 0; i < 3; i++) {
      const a = orbitT * 2 + i * (Math.PI * 2 / 3);
      const px = x + Math.cos(a) * r;
      const py = y + Math.sin(a) * r;
      g.fillStyle(0xdedaff, 0.95);
      g.fillCircle(px, py, s * 0.16);
    }

    // center eye
    g.fillStyle(0xffffff, 0.95);
    g.fillCircle(x, y, s * 0.18);

    e.drawHPBar(g);
  },
};