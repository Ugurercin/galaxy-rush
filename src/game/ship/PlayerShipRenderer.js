// PlayerShipRenderer — controls how the player ship looks
// Edit freely without touching game logic
//
// ── Tune these ───────────────────────────────────────────
// All colors, proportions and visual effects are here
// ship.x, ship.y, ship.w, ship.h come from PlayerShip
// scene is passed for time-based animations (flicker, pulse)

const PlayerShipRenderer = {

  draw(g, ship, scene) {
    const { x, y, w, h } = ship;

    // ── Engine trail ──────────────────────────────────────
    g.fillStyle(0x00e5ff, 0.12);
    g.fillTriangle(
      x,           y + h * 0.5,
      x - w * 0.3, y + h * 1.1,
      x + w * 0.3, y + h * 1.1
    );
    g.fillStyle(0x00e5ff, 0.25);
    g.fillTriangle(
      x,            y + h * 0.5,
      x - w * 0.18, y + h * 0.95,
      x + w * 0.18, y + h * 0.95
    );

    // ── Main hull ─────────────────────────────────────────
    g.fillStyle(0x0d2a4a, 1);
    g.fillTriangle(
      x,           y - h * 0.5,
      x - w * 0.5, y + h * 0.5,
      x + w * 0.5, y + h * 0.5
    );

    // ── Wings ─────────────────────────────────────────────
    g.fillStyle(0x0a2040, 1);
    g.fillTriangle(
      x - w * 0.2, y + h * 0.1,
      x - w * 0.7, y + h * 0.55,
      x - w * 0.1, y + h * 0.5
    );
    g.fillTriangle(
      x + w * 0.2, y + h * 0.1,
      x + w * 0.7, y + h * 0.55,
      x + w * 0.1, y + h * 0.5
    );

    // ── Hull outline ──────────────────────────────────────
    g.lineStyle(1, 0x00e5ff, 0.8);
    g.strokeTriangle(
      x,           y - h * 0.5,
      x - w * 0.5, y + h * 0.5,
      x + w * 0.5, y + h * 0.5
    );

    // ── Cockpit ───────────────────────────────────────────
    g.fillStyle(0x00e5ff, 0.6);
    g.fillTriangle(
      x,            y - h * 0.25,
      x - w * 0.15, y + h * 0.1,
      x + w * 0.15, y + h * 0.1
    );

    // ── Engine glow dots ──────────────────────────────────
    g.fillStyle(0x00e5ff, 0.9);
    g.fillCircle(x - w * 0.18, y + h * 0.45, 2.5);
    g.fillCircle(x + w * 0.18, y + h * 0.45, 2.5);
  },

  // ── Ghost mode — purple shimmer ───────────────────────
  drawGhost(g, ship, scene) {
    if (Math.floor(scene.time.now / 80) % 2 === 0) {
      g.fillStyle(0xce93d8, 0.3);
      g.fillCircle(ship.x, ship.y, 28);
    }
  },

  // ── Shield ring — animated pulse ──────────────────────
  drawShield(g, ship, scene) {
    const pulse = 0.7 + Math.sin(scene.time.now / 200) * 0.3;
    g.lineStyle(1.5, 0x69ff47, pulse);
    g.strokeCircle(ship.x, ship.y, 26);
  },

  // ── Damage flash — blink when invincible ──────────────
  shouldSkipDraw(ship, scene) {
    return !scene.ghostMode
      && scene.invincible
      && Math.floor(scene.time.now / 120) % 2 === 0;
  },
};