// FiringBase — base class all firing modes extend
// Each mode controls how bullets are created and drawn
//
// scene.bullets    — array of active player bullets
// scene.ship       — { x, y, w, h }
// scene.fireRate   — ms between shots (affected by upgrades)

class FiringBase {
  constructor(scene) {
    this.scene = scene;

    // ── Override in subclasses ────────────────────────────
    this.key         = 'single';
    this.label       = 'Single';
    this.icon        = '▲';
    this.color       = '#00e5ff';
    this.fireRateMod = 1.0;
  }

  // Called every update frame — override to fire bullets
  update(time, delta) {}

  // Called by GameScene draw — override for special FX (laser etc.)
  draw(g) {}

  // Called when mode is switched away from — clean up FX
  deactivate() {}

  // Helper — effective fire rate for this mode
  effectiveFireRate() {
    return this.scene.fireRate * this.fireRateMod;
  }
}