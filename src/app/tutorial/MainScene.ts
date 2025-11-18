import PhysicsGroup = Phaser.Physics.Arcade.Group;
import StaticPhysicsGroup = Phaser.Physics.Arcade.StaticGroup;
import ArcadeSprite = Phaser.Physics.Arcade.Sprite;
import ArcadeGameObject = Phaser.Types.Physics.Arcade.GameObjectWithBody;

export class MainScene extends Phaser.Scene {
  private platforms!: StaticPhysicsGroup;
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Phaser.Types.Input.Keyboard.CursorKeys;

  private stars!: PhysicsGroup
  private bombs!: PhysicsGroup

  private score = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private gameOver = false;

  constructor() {
    super({key: 'MainScene'});
  }

  create() {
    this.createKeyboardInput();

    this.createEnvironment();

    this.createPlayer();

    this.createStars();

    this.bombs = this.physics.add.group();

    this.initColliders();

    this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', color: '#000000' });
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

  private collectStar (_player: ArcadeGameObject | Phaser.Tilemaps.Tile | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody, star: ArcadeGameObject | Phaser.Tilemaps.Tile | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody): void {
    (star as ArcadeSprite).disableBody(true, true);

    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);

    if (this.stars.countActive(true) === 0) {
      this.stars.children.iterate((child) => {
        const sprite = child as ArcadeSprite;
        sprite.enableBody(true, sprite.x, 0, true, true);
        return true;
      });

      const x = (this.player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

      const bomb = this.bombs.create(x, 16, 'bomb') as ArcadeSprite;
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }
  }

  private hitBomb (_player: ArcadeGameObject | Phaser.Tilemaps.Tile | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody, _bomb: ArcadeGameObject | Phaser.Tilemaps.Tile | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody): void {
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

    this.stars.children.iterate((child) => {
      const sprite = child as ArcadeSprite;
      sprite.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
      return true;
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
    const left = this.cursors.left.isDown || this.keys.left.isDown;
    const right = this.cursors.right.isDown || this.keys.right.isDown;
    const up = this.cursors.up.isDown || this.keys.up.isDown || this.keys.space.isDown;

    if (left) {
      this.player.setVelocityX(-160);
      this.player.anims.play('left', true);
    } else if (right) {
      this.player.setVelocityX(160);
      this.player.anims.play('right', true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play('turn');
    }

    if (up && this.player.body?.touching.down) {
      this.player.setVelocityY(-330);
    }
  }

  private createKeyboardInput(): void {
    this.cursors = this.input.keyboard?.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;

    this.keys = this.input.keyboard?.addKeys({
      'up': Phaser.Input.Keyboard.KeyCodes.W,
      'left': Phaser.Input.Keyboard.KeyCodes.A,
      'right': Phaser.Input.Keyboard.KeyCodes.D,
      'space': Phaser.Input.Keyboard.KeyCodes.SPACE,
    }) as Phaser.Types.Input.Keyboard.CursorKeys;
  }
}
