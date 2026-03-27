class SingleShot extends FiringBase {
  constructor(scene) {
    super(scene);
    this.key = 'single';
    this.label = 'Single';
    this.icon = '•';
    this.color = '#ffffff';
    this.fireRateMod = 1;
    this.bulletSpeed = 10;
    this._lastFired = 0;
  }

  update(time, delta) {
    if (time < this._lastFired + this.effectiveFireRate()) return;
    this._lastFired = time;

    const { x, y, h } = this.scene.ship;
    const by = y - h / 2;

    if (this.scene.spreadShot) {
      this.scene.bullets.push({ x, y: by, speed: this.bulletSpeed, vx: 0 });
      this.scene.bullets.push({ x: x - 8, y: by, speed: this.bulletSpeed, vx: -2.2 });
      this.scene.bullets.push({ x: x + 8, y: by, speed: this.bulletSpeed, vx: 2.2 });
    } else {
      this.scene.bullets.push({ x, y: by, speed: this.bulletSpeed, vx: 0 });
    }

    soundManager.play('shoot');
  }

  draw(g) { g.clear(); }
  deactivate() {}
}