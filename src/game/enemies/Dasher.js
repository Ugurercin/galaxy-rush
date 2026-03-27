// Dasher — wave 3+
// Drops down slowly, then snaps sideways in a burst
// Great for surprise lane denial

class Dasher extends EnemyBase {
  constructor(scene, wave) {
    const { width } = scene.scale;
    const size = Phaser.Math.Between(18, 24);
    const x    = Phaser.Math.Between(size + 20, width - size - 20);
    const y    = -size;
    super(scene, x, y);

    this.type       = 'dasher';
    this.size       = size;
    this.hp         = 2;
    this.maxHp      = 2;
    this.speed      = Phaser.Math.FloatBetween(1.4, 2.0) + (wave - 1) * 0.2;
    this.color      = 0xffdd44;
    this.scoreValue = 11;
    this.coinValue  = 22;

    this.state          = 'drop';   // drop -> charge -> dash
    this.stateTimer     = 0;
    this.chargeTime     = Phaser.Math.Between(500, 850);
    this.dashTime       = 220;
    this.dashSpeed      = 7 + (wave - 1) * 0.35;
    this.dashDir        = 0;
  }

  update(delta) {
    this.stateTimer += delta;

    if (this.state === 'drop') {
      this.y += this.speed;

      if (this.y > 80) {
        this.state = 'charge';
        this.stateTimer = 0;
      }
      return;
    }

    if (this.state === 'charge') {
      this.y += this.speed * 0.45;

      if (this.stateTimer >= this.chargeTime) {
        const dx = this.scene.ship.x - this.x;
        this.dashDir = dx === 0 ? Phaser.Math.RND.pick([-1, 1]) : Math.sign(dx);
        this.state = 'dash';
        this.stateTimer = 0;
      }
      return;
    }

    if (this.state === 'dash') {
      this.y += this.speed * 0.55;
      this.x += this.dashDir * this.dashSpeed;

      if (this.stateTimer >= this.dashTime) {
        this.state = 'charge';
        this.stateTimer = 0;
        this.chargeTime = Phaser.Math.Between(500, 900);
      }
    }

    const minX = this.size + 8;
    const maxX = this.scene.scale.width - this.size - 8;
    this.x = Phaser.Math.Clamp(this.x, minX, maxX);
  }

  draw(g) {
    DasherRenderer.draw(g, this);
  }
}