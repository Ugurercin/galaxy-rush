// BackgroundRenderer — draws the parallax star field
// Edit to change space background feel
//
// ── Tune these ───────────────────────────────────────────
// bgColor      — space background color
// starColor    — star color

const BackgroundRenderer = {
  bgColor:   0x060a12,
  starColor: 0xffffff,

  draw(g, stars, width, height) {
    g.clear();

    // Deep space background
    g.fillStyle(this.bgColor, 1);
    g.fillRect(0, 0, width, height);

    // Stars — each has its own alpha for depth layers
    stars.forEach(s => {
      g.fillStyle(this.starColor, s.alpha);
      g.fillRect(s.x, s.y, s.size, s.size);
    });
  },
};