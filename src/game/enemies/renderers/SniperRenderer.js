const SniperRenderer = {
  draw(g, e) {
    const { x, y, size: s, color, aiming, flash } = e;

    // slim body
    g.fillStyle(color, 0.9);
    g.fillRect(x - s * 0.35, y - s * 0.75, s * 0.7, s * 1.5);

    // side fins
    g.fillStyle(0xff99aa, 0.75);
    g.fillTriangle(x - s * 0.35, y - s * 0.2, x - s * 0.9, y + s * 0.1, x - s * 0.35, y + s * 0.3);
    g.fillTriangle(x + s * 0.35, y - s * 0.2, x + s * 0.9, y + s * 0.1, x + s * 0.35, y + s * 0.3);

    // barrel
    g.fillStyle(0xffffff, 0.9);
    g.fillRect(x - 2, y + s * 0.4, 4, s * 0.75);

    // scope eye
    const pulse = aiming ? 0.7 + Math.sin(this._t || 0) * 0.25 : 0.25;
    g.fillStyle(0xffdde4, 0.95);
    g.fillCircle(x, y - s * 0.15, s * 0.18);

    if (aiming) {
      const alpha = 0.3 + 0.35 * Math.sin(flash * 0.03);
      g.lineStyle(2, 0xff3355, alpha);
      g.strokeCircle(x, y - s * 0.15, s * 0.34);
    }

    g.lineStyle(1, 0xffaabb, 0.9);
    g.strokeRect(x - s * 0.35, y - s * 0.75, s * 0.7, s * 1.5);

    e.drawHPBar(g);
  },
};