export class MainScene extends Phaser.Scene {
  planes = [];

  constructor() {
    super({key: 'MainScene Planes'});
  }

  preload() {
    this.load.image('bg', 'assets/planes/deepblue.png');
    this.load.image('plane', 'assets/planes/ww2plane.png');
  }

  create() {
    this.add.image(400, 300, 'bg');

    this.cameras.main.setBounds(0, 0, 800, 600);
    // todo rewrite with this.physics.add.group
    for (let i = 0; i < 128; i++) {
      const x = Phaser.Math.Between(0, 800);
      const y = Phaser.Math.Between(0, 600);

      // @ts-ignore
      this.planes.push(this.add.image(x, y, 'plane'));
    }
  }

  override update() {
    Phaser.Actions.IncY(this.planes, -1, -0.025);

    Phaser.Actions.WrapInRectangle(this.planes, this.cameras.main.getBounds(), 128);
  }
}
