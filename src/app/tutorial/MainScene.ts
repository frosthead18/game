import GameObjectWithBody = Phaser.Types.Physics.Arcade.GameObjectWithBody;
import Tile = Phaser.Tilemaps.Tile;

export class MainScene extends Phaser.Scene {
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  private stars!: Phaser.Physics.Arcade.Group
  private bombs!: Phaser.Physics.Arcade.Group

  private score = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private gameOver = false;

  constructor() {
    super({key: 'MainScene'});
  }

  create() {
    // create keyboard input
    this.cursors = this.input.keyboard?.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;

    this.createEnvironment();
    // @ts-ignore
    this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000000' });

    this.createPlayer();
    this.createStars();

    this.bombs = this.physics.add.group();

    this.initColliders();
  }

  preload() {
    this.load.image('sky', 'assets/tutorial/sky.png');
    this.load.image('ground', 'assets/tutorial/platform.png');
    this.load.image('star', 'assets/tutorial/star.png');
    this.load.image('bomb', 'assets/tutorial/bomb.png');
    this.load.spritesheet('dude',
      'assets/tutorial/dude.png',
      {frameWidth: 32, frameHeight: 48}
    );
  }

  override update() {
    this.bindKeys();
  }

  private collectStar (player: Tile | GameObjectWithBody, star: Tile | GameObjectWithBody): void {
    // @ts-ignore
    star.disableBody(true, true);

    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);

    if (this.stars.countActive(true) === 0) {
      this.stars.children.iterate((child) => {
        // @ts-ignore
        return child.enableBody(true, child.x, 0, true, true);
      });

      const x = (this.player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

      const bomb = this.bombs.create(x, 16, 'bomb');
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }
  }

  private hitBomb (player: Tile | GameObjectWithBody, bomb: Tile | GameObjectWithBody): void {
    this.physics.pause();
    this.player.setTint(0xff0000);
    this.player.anims.play('turn');
    this.gameOver = true;
  }

  private createEnvironment(): void {
    this.add.image(400, 300, 'sky');
    // create platforms
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    this.platforms.create(600, 400, 'ground');
    this.platforms.create(800, 100, 'ground');
    this.platforms.create(100, 250, 'ground');
    this.platforms.create(750, 220, 'ground');
  }

  private createPlayer(): void {
    this.player = this.physics.add.sprite(100, 450, 'dude');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('dude', {start: 0, end: 3}),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'turn',
      frames: [{key: 'dude', frame: 4}],
      frameRate: 20
    });
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude', {start: 5, end: 8}),
      frameRate: 10,
      repeat: -1
    });
  }

  private createStars(): void {
    this.stars = this.physics.add.group({
      key: 'star',
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 }
    });

    this.stars.children.iterate( (child) => {
      // @ts-ignore
      return child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });
  }

  private initColliders(): void {
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.stars, this.platforms);
    this.physics.add.overlap(this.player, this.stars, this.collectStar, undefined, this);
    this.physics.add.collider(this.bombs, this.platforms);
    this.physics.add.collider(this.player, this.bombs, this.hitBomb, undefined, this);
  }

  private bindKeys(): void {
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);

      this.player.anims.play('left', true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);

      this.player.anims.play('right', true);
    } else {
      this.player.setVelocityX(0);

      this.player.anims.play('turn');
    }

    if (this.cursors.up.isDown && this.player.body?.touching.down) {
      this.player.setVelocityY(-330);
    }
  }
}
