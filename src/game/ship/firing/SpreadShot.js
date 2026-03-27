class SpreadShot extends FiringBase {
  constructor(scene) {
    super(scene);
    this.key = 'spread';
    this.label = 'Spread';
    this.icon = '⋀';
    this.color = '#e040fb';
    this.fireRateMod = 0.95;
    this.bulletSpeed = 10;
    this.sideVX = 2.2;
    this._lastFired = 0;
  }

  update(time, delta) {
    if (time < this._lastFired + this.effectiveFireRate()) return;
    this._lastFired = time;

    const { x, y, h } = this.scene.ship;
    const by = y - h / 2;

    this.scene.bullets.push({
      x,
      y: by,
      speed: this.bulletSpeed,
      vx: 0,
    });

    this.scene.bullets.push({
      x: x - 8,
      y: by,
      speed: this.bulletSpeed,
      vx: -this.sideVX,
    });

    this.scene.bullets.push({
      x: x + 8,
      y: by,
      speed: this.bulletSpeed,
      vx: this.sideVX,
    });

    soundManager.play('shoot');
  }

  draw(g) {
    g.clear();
  }

  deactivate() {}
}