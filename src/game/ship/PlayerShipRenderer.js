const PlayerShipRenderer = {
  draw(g, ship, scene) {
    const { x, y, w, h } = ship;
    const t = scene.time.now;

    const enginePulse = 0.75 + Math.sin(t / 70) * 0.2;
    const glowPulse = 0.45 + Math.sin(t / 120) * 0.12;

    // ── Engine flame outer ────────────────────────────────
    g.fillStyle(0x00e5ff, 0.10 * enginePulse);
    g.fillTriangle(
      x,           y + h * 0.48,
      x - w * 0.34, y + h * 1.18,
      x + w * 0.34, y + h * 1.18
    );

    // ── Engine flame mid ──────────────────────────────────
    g.fillStyle(0x4df6ff, 0.20 * enginePulse);
    g.fillTriangle(
      x,            y + h * 0.45,
      x - w * 0.22, y + h * 0.98,
      x + w * 0.22, y + h * 0.98
    );

    // ── Engine flame core ─────────────────────────────────
    g.fillStyle(0xffffff, 0.28 * enginePulse);
    g.fillTriangle(
      x,            y + h * 0.42,
      x - w * 0.11, y + h * 0.78,
      x + w * 0.11, y + h * 0.78
    );

    // ── Outer wings ───────────────────────────────────────
    g.fillStyle(0x13294a, 1);
    g.fillTriangle(
      x - w * 0.16, y + h * 0.08,
      x - w * 0.82, y + h * 0.54,
      x - w * 0.20, y + h * 0.56
    );
    g.fillTriangle(
      x + w * 0.16, y + h * 0.08,
      x + w * 0.82, y + h * 0.54,
      x + w * 0.20, y + h * 0.56
    );

    // ── Main hull ─────────────────────────────────────────
    g.fillStyle(0x18385d, 1);
    g.fillTriangle(
      x,           y - h * 0.62,
      x - w * 0.40, y + h * 0.52,
      x + w * 0.40, y + h * 0.52
    );

    // ── Inner hull plate ──────────────────────────────────
    g.fillStyle(0x244f7a, 1);
    g.fillTriangle(
      x,            y - h * 0.48,
      x - w * 0.22, y + h * 0.34,
      x + w * 0.22, y + h * 0.34
    );

    // ── Center spine ──────────────────────────────────────
    g.fillStyle(0x7fe7ff, 0.85);
    g.fillRect(
      x - w * 0.045,
      y - h * 0.30,
      w * 0.09,
      h * 0.52
    );

    // ── Nose tip highlight ────────────────────────────────
    g.fillStyle(0xffffff, 0.8);
    g.fillTriangle(
      x,            y - h * 0.62,
      x - w * 0.06, y - h * 0.42,
      x + w * 0.06, y - h * 0.42
    );

    // ── Cockpit glow ──────────────────────────────────────
    g.fillStyle(0x5df2ff, 0.85 + glowPulse * 0.2);
    g.fillEllipse(
      x,
      y - h * 0.10,
      w * 0.22,
      h * 0.30
    );

    // ── Wing light strips ─────────────────────────────────
    g.lineStyle(1.5, 0x00e5ff, 0.65);
    g.beginPath();
    g.moveTo(x - w * 0.18, y + h * 0.20);
    g.lineTo(x - w * 0.52, y + h * 0.45);
    g.strokePath();

    g.beginPath();
    g.moveTo(x + w * 0.18, y + h * 0.20);
    g.lineTo(x + w * 0.52, y + h * 0.45);
    g.strokePath();

    // ── Side cannons ──────────────────────────────────────
    g.fillStyle(0x9adfff, 0.95);
    g.fillRect(x - w * 0.44, y + h * 0.18, w * 0.07, h * 0.16);
    g.fillRect(x + w * 0.37, y + h * 0.18, w * 0.07, h * 0.16);

    // ── Engine ports ──────────────────────────────────────
    g.fillStyle(0x00e5ff, 0.95);
    g.fillCircle(x - w * 0.16, y + h * 0.42, 3);
    g.fillCircle(x + w * 0.16, y + h * 0.42, 3);
    g.fillCircle(x,            y + h * 0.38, 2.2);

    // ── Outline ───────────────────────────────────────────
    g.lineStyle(1.4, 0x8ff6ff, 0.9);
    g.strokeTriangle(
      x,           y - h * 0.62,
      x - w * 0.40, y + h * 0.52,
      x + w * 0.40, y + h * 0.52
    );

    g.lineStyle(1, 0x56dfff, 0.55);
    g.strokeTriangle(
      x - w * 0.16, y + h * 0.08,
      x - w * 0.82, y + h * 0.54,
      x - w * 0.20, y + h * 0.56
    );
    g.strokeTriangle(
      x + w * 0.16, y + h * 0.08,
      x + w * 0.82, y + h * 0.54,
      x + w * 0.20, y + h * 0.56
    );
  },

  drawGhost(g, ship, scene) {
    const pulse = 0.18 + (Math.sin(scene.time.now / 90) + 1) * 0.08;
    g.fillStyle(0xc77dff, pulse);
    g.fillEllipse(ship.x, ship.y + 2, 44, 56);

    g.lineStyle(1.2, 0xe0aaff, 0.55);
    g.strokeEllipse(ship.x, ship.y + 2, 44, 56);
  },

  drawShield(g, ship, scene) {
    const pulse = 0.65 + Math.sin(scene.time.now / 180) * 0.25;

    g.lineStyle(2, 0x69ff47, pulse);
    g.strokeCircle(ship.x, ship.y, 28);

    g.lineStyle(1, 0xb9ff9f, pulse * 0.55);
    g.strokeCircle(ship.x, ship.y, 32);
  },

  shouldSkipDraw(ship, scene) {
    return (
      !scene.ghostMode &&
      scene.invincible &&
      Math.floor(scene.time.now / 120) % 2 === 0
    );
  },
};