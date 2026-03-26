class Rocket extends FiringBase {
  constructor(scene) {
    super(scene);
    this.key          = 'rocket';
    this.label        = 'Rocket';
    this.icon         = '◈';
    this.color        = '#ff9900';
    this.fireRateMod  = 3.5;
    this.bulletSpeed  = 5;
    this.splashRadius = 60;
    this.splashDamage = 3;
    this._lastFired   = 0;
  }

  update(time, delta) {
    if (time < this._lastFired + this.effectiveFireRate()) return;
    this._lastFired = time;
    const { x, y, h } = this.scene.ship;
    this.scene.bullets.push({
      x, y: y - h / 2,
      speed:        this.bulletSpeed,
      vx:           0,
      isRocket:     true,
      splashRadius: this.splashRadius,
      splashDamage: this.splashDamage,
    });
    soundManager.play('shoot');
  }

  draw(g) { g.clear(); }
  deactivate() {}
}