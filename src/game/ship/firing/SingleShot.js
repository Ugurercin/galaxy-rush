class SingleShot extends FiringBase {
  constructor(scene) {
    super(scene);
    this.key         = 'single';
    this.label       = 'Single';
    this.icon        = '▲';
    this.color       = '#00e5ff';
    this.fireRateMod = 1.0;
    this.bulletSpeed = 10;
    this._lastFired  = 0;
  }

  update(time, delta) {
    if (time < this._lastFired + this.effectiveFireRate()) return;
    this._lastFired = time;
    const { x, y, h } = this.scene.ship;
    this.scene.bullets.push({ x, y: y - h / 2, speed: this.bulletSpeed, vx: 0 });
    soundManager.play('shoot');
  }

  draw(g) { g.clear(); }
  deactivate() {}
}