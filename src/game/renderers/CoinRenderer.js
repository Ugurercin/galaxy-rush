// CoinRenderer — draws collectible coin drops
// Edit freely to change how coins look
//
// ── Tune these ───────────────────────────────────────────

const CoinRenderer = {

  draw(g, coinDrops) {
    g.clear();
    coinDrops.forEach(c => {
      const pulse = 1 + Math.sin(c.pulse) * 0.15;
      const r     = c.size * pulse;

      // Outer glow ring
      g.fillStyle(0xffeb3b, 0.18);
      g.fillCircle(c.x, c.y, r + 4);

      // Coin body
      g.fillStyle(0xffcc00, 1);
      g.fillCircle(c.x, c.y, r);

      // Inner highlight
      g.fillStyle(0xffee88, 0.9);
      g.fillCircle(c.x - r * 0.25, c.y - r * 0.25, r * 0.4);

      // Thin outline
      g.lineStyle(0.8, 0xff9900, 0.8);
      g.strokeCircle(c.x, c.y, r);
    });
  },
};