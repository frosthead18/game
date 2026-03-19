export class MainScene extends Phaser.Scene {
  private player!: Phaser.Physics.Matter.Sprite;
  private keys!: any;

  //player status variables used for later
  private isKnockedDown: boolean = false; //is our player knocked down?
  private lastDirection: string = "down";//what was the last direction our player was facing?
  private playerVelocity = new Phaser.Math.Vector2(); //track player velocity in a 2d vector

  constructor() {
    super({key: 'MainScene'});
  }

  create() {
    this.player = this.matter.add.sprite(100, 100, 'player');
    this.player.setSize(1, 1);
    this.player.setScale(1.3, 1.3)

    this.keys = this.input.keyboard?.addKeys({
      'up': Phaser.Input.Keyboard.KeyCodes.W,
      'down': Phaser.Input.Keyboard.KeyCodes.S,
      'left': Phaser.Input.Keyboard.KeyCodes.A,
      'right': Phaser.Input.Keyboard.KeyCodes.D,
      'space': Phaser.Input.Keyboard.KeyCodes.SPACE,
      's1': Phaser.Input.Keyboard.KeyCodes.ONE
    });

    this.anims.create({
      key: 'attack_down',
      frames: this.anims.generateFrameNumbers('player', {start: 36, end: 39}),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'attack_right',
      frames: this.anims.generateFrameNumbers('player', {start: 42, end: 45}),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'attack_left',
      frames: this.anims.generateFrameNumbers('player', {start: 42, end: 45}),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'attack_up',
      frames: this.anims.generateFrameNumbers('player', {start: 48, end: 51}),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'move_x',
      frames: this.anims.generateFrameNumbers('player', {start: 24, end: 29}),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'up',
      frames: this.anims.generateFrameNumbers('player', {start: 30, end: 35}),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'down',
      frames: this.anims.generateFrameNumbers('player', {start: 18, end: 23}),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'stand_down',
      frames: this.anims.generateFrameNumbers('player', {start: 0, end: 5}),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'stand_up',
      frames: this.anims.generateFrameNumbers('player', {start: 12, end: 17}),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'stand_left',
      frames: this.anims.generateFrameNumbers('player', {start: 6, end: 11}),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'stand_right',
      frames: this.anims.generateFrameNumbers('player', {start: 6, end: 11}),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'dead',
      frames: this.anims.generateFrameNumbers('player', {start: 54, end: 56}),
      frameRate: 4,
      repeat: -1,
    });
    this.anims.create({
      key: 'laying',
      frames: this.anims.generateFrameNumbers('player', {start: 56, end: 56}),
      frameRate: 10,
      repeat: 10,
    });
  }

  preload() {
    this.load.spritesheet("player", "assets/characters/player.png", {
      frameWidth: 48,
      frameHeight: 48
    })
  }

  override update() {
    if (this.isIdle()) {
      this.playIdleAnimation();
    }

    this.updateKnockdownStatus();

    if (this.isKnockedDown) {
      if (this.keys.s1.isDown) {
        this.triggerKnockdown();
      }

      return;
    }

    if (this.keys.space.isDown) {
      this.handleAttack();

      return; // Prevent movement updates while attacking
    }

    this.handleMovement();
  }

  private isIdle(): boolean {
    return (
      this.keys.up.isUp &&
      this.keys.down.isUp &&
      this.keys.left.isUp &&
      this.keys.right.isUp &&
      this.keys.space.isUp &&
      !this.isKnockedDown
    );
  }

// Play standing animation
  private playIdleAnimation(): void {
    this.player.anims.play('stand_' + this.lastDirection, true);
  }

// Update knockdown status
  private updateKnockdownStatus(): void {
    if (this.player.anims.currentAnim?.key === 'stand_' + this.lastDirection) {
      this.isKnockedDown = false;
    }
  }

  // Trigger knockdown sequence
  private triggerKnockdown(): void {
    this.player.setVelocity(0, this.playerVelocity.y);
    this.isKnockedDown = true;
    // @ts-ignore
    this.player.anims.play('dead').stopAfterRepeat(0);
    this.player.anims.chain('laying');
    this.player.anims.chain('stand_' + this.lastDirection);
  }


  // Handle attack
  private handleAttack(): void {
    this.player.setVelocity(0, 0);
    this.player.anims.play('attack_' + this.lastDirection, true);
  }

  // Handle movement
  private handleMovement(): void {
    let moveX = 0;
    let moveY = 0;

    if (this.keys.left.isDown) {
      moveX = -1;
      this.player.setFlipX(true);
      this.lastDirection = "left";
    } else if (this.keys.right.isDown) {
      moveX = 1;
      this.player.setFlipX(false);
      this.lastDirection = "right";
    }

    if (this.keys.up.isDown) {
      moveY = -1;
      this.lastDirection = "up";
    } else if (this.keys.down.isDown) {
      moveY = 1;
      this.lastDirection = "down";
    }

    if (moveX !== 0 || moveY !== 0) {
      this.player.anims.play(moveX !== 0 ? "move_x" : this.lastDirection, true);
    }

    this.player.setVelocity(moveX, moveY);
  }
}
