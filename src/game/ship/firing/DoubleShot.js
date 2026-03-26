class DoubleShot extends FiringBase {
  constructor(scene) {
    super(scene);
    this.key         = 'double';
    this.label       = 'Double';
    this.icon        = '⋈';
    this.color       = '#69ff47';
    this.fireRateMod = 1.15;
    this.bulletSpeed = 10;
    this.spread      = 10;
    this._lastFired  = 0;
  }

  update(time, delta) {
    if (time < this._lastFired + this.effectiveFireRate()) return;
    this._lastFired = time;
    const { x, y, h } = this.scene.ship;
    const by = y - h / 2;
    this.scene.bullets.push({ x: x - this.spread, y: by, speed: this.bulletSpeed, vx: 0 });
    this.scene.bullets.push({ x: x + this.spread, y: by, speed: this.bulletSpeed, vx: 0 });
    soundManager.play('shoot');
  }

  draw(g) { g.clear(); }
  deactivate() {}
}