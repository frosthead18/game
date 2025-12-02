import TilemapLayer = Phaser.Tilemaps.TilemapLayer;
import ArcadeColliderType = Phaser.Types.Physics.Arcade.ArcadeColliderType;
import {createLizardAnimations, LizardMovement} from "../enemies/lizard/lizard-animations";
import {createFauneAnimations, FauneMovement} from "../characters/faune/faune-animations";
import {Lizard} from "../enemies/lizard/Lizard";
import {Faune} from "../characters/faune/Faune";

export class Game extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private faune!: Faune;
  private lizards!: Phaser.Physics.Arcade.Group;
  private lastFauneDirection: FauneMovement = FauneMovement.idleDown;

  constructor() {
    super('game');
  }

  preload(): void {
    this.cursors = this.input.keyboard?.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;
  }

  create() : void {
    const gameMap = this.make.tilemap({key: 'dungeon'});
    const tileSet = gameMap.addTilesetImage('dungeon', 'tiles');

    gameMap.createLayer('Ground',(tileSet as Phaser.Tilemaps.Tileset), 0, 0);
    const wallsLayer = gameMap.createLayer('Walls',(tileSet as Phaser.Tilemaps.Tileset), 0, 0);
    wallsLayer?.setCollisionByProperty({collides: true});

    // debug collision layout
    // this.debugCollisionLayout(wallsLayer);

    // create animations
    createFauneAnimations(this.anims);
    createLizardAnimations(this.anims);

    // character creation
    this.faune = this.physics.add.existing(new Faune(this, 128, 128, 'faune', 'walk-down-3.png')) as Faune;
    this.faune.body?.setSize(this.faune.width * 0.5, this.faune.height * 0.8);

    // enemy creation
    this.lizards = this.physics.add.group({
      classType: Lizard,
      createCallback: (gameObject: Phaser.GameObjects.GameObject) => {
        const lizardGameObject = gameObject as Lizard;

        lizardGameObject!.body!.onCollide = true;
      }
    });

    this.lizards.get(256, 128, 'lizard');

    // set character collision
    this.physics.add.collider(this.faune, wallsLayer as ArcadeColliderType);
    this.physics.add.collider(this.lizards, wallsLayer as ArcadeColliderType);
    this.physics.add.collider(this.faune, this.lizards);

    this.cameras.main.startFollow(this.faune, true);
  }

  override update(time: number, delta: number) {
    if (!this.cursors || !this.faune) {
      return;
    }

    this.handleFauneMovement()
  }

  private handleFauneMovement(): void {
    const speed = 100;
    let moveX = 0;
    let moveY = 0;

    if (this.cursors.left?.isDown) {
      moveX = -1;
      this.faune.setFlipX(true);
      this.lastFauneDirection = FauneMovement.runSide;
    } else if (this.cursors.right?.isDown) {
      moveX = 1;
      this.faune.setFlipX(false);
      this.lastFauneDirection = FauneMovement.runSide;
    }

    if (this.cursors.up?.isDown) {
      moveY = -1;
      this.lastFauneDirection = FauneMovement.runUp;
    } else if (this.cursors.down?.isDown) {
      moveY = 1;
      this.lastFauneDirection = FauneMovement.runDown;
    }

    if (moveX !== 0 || moveY !== 0) {
      this.faune.anims.play(this.lastFauneDirection, true);
    } else {
      this.handleFauneIdleAnimation()
    }

    this.faune.setVelocity(moveX * speed, moveY * speed);
  }

  private handleFauneIdleAnimation(): void {
    const idleAction = this.lastFauneDirection.replace(/-.*?-/, '-idle-');

    this.faune.anims.play(idleAction);
  }

  private debugCollisionLayout(wallsLayer: TilemapLayer | null) {
    const debugGraphics = this.add.graphics().setAlpha(0.7);

    wallsLayer?.renderDebug(debugGraphics, {
      tileColor: null,
      collidingTileColor: new Phaser.Display.Color(243, 234,48, 255),
      faceColor: new Phaser.Display.Color(40, 39, 37, 255),
    })
  }
}
