// ParticleRenderer — draws explosion and FX particles
// Edit freely to change how explosions look
//
// ── Tune these ───────────────────────────────────────────

const ParticleRenderer = {

  draw(g, particles) {
    g.clear();
    particles.forEach(p => {
      g.fillStyle(p.color, p.alpha);
      g.fillCircle(p.x, p.y, p.size);
    });
  },
};