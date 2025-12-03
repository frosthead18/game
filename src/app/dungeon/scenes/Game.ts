import TilemapLayer = Phaser.Tilemaps.TilemapLayer;
import ArcadeColliderType = Phaser.Types.Physics.Arcade.ArcadeColliderType;
import {createLizardAnimations} from "../enemies/lizard/lizard-animations";
import {createFauneAnimations} from "../characters/faune/faune-animations";
import {Lizard} from "../enemies/lizard/Lizard";
import {Faune} from "../characters/faune/Faune";
import {ASSET_KEYS, GAME_CONFIG, SCENE_KEYS} from "../constants";

export class Game extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private faune!: Faune;
  private lizards!: Phaser.Physics.Arcade.Group;

  constructor() {
    super(SCENE_KEYS.game);
  }

  preload(): void {
    this.cursors = this.input.keyboard?.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;
  }

  create(): void {
    const wallsLayer = this.createMap();
    this.createAnimations();
    this.createPlayer();
    this.createEnemies();
    this.setupCollisions(wallsLayer);
    this.setupCamera();
  }

  override update(time: number, delta: number): void {
    // Updates are handled in individual character classes
  }

  private createMap(): TilemapLayer | null {
    const gameMap = this.make.tilemap({key: ASSET_KEYS.dungeon});
    const tileSet = gameMap.addTilesetImage(ASSET_KEYS.dungeon, ASSET_KEYS.tiles);

    if (!tileSet) {
      console.error('Failed to load tileset');
      return null;
    }

    gameMap.createLayer('Ground', tileSet, 0, 0);
    const wallsLayer = gameMap.createLayer('Walls', tileSet, 0, 0);
    wallsLayer?.setCollisionByProperty({collides: true});

    // Uncomment to debug collision layout
    this.debugCollisionLayout(wallsLayer);

    return wallsLayer;
  }

  private createAnimations(): void {
    createFauneAnimations(this.anims);
    createLizardAnimations(this.anims);
  }

  private createPlayer(): void {
    this.faune = new Faune(
      this,
      GAME_CONFIG.player.startX,
      GAME_CONFIG.player.startY,
      ASSET_KEYS.faune,
      'walk-down-3.png'
    );
    this.faune.setCursors(this.cursors);
  }

  private createEnemies(): void {
    this.lizards = this.physics.add.group({
      classType: Lizard,
      createCallback: (gameObject: Phaser.GameObjects.GameObject) => {
        const lizard = gameObject as Lizard;
        if (lizard.body) {
          lizard.body.onCollide = true;
        }
      }
    });

    this.lizards.get(GAME_CONFIG.lizard.startX, GAME_CONFIG.lizard.startY, ASSET_KEYS.lizard);
  }

  private setupCollisions(wallsLayer: TilemapLayer | null): void {
    if (!wallsLayer) {
      return;
    }

    this.physics.add.collider(this.faune, wallsLayer as ArcadeColliderType);
    this.physics.add.collider(this.lizards, wallsLayer as ArcadeColliderType);
    this.physics.add.collider(this.faune, this.lizards);
  }

  private setupCamera(): void {
    this.cameras.main.startFollow(this.faune, true);
  }

  private debugCollisionLayout(wallsLayer: TilemapLayer | null): void {
    if (!wallsLayer) {
      return;
    }

    const debugGraphics = this.add.graphics().setAlpha(GAME_CONFIG.debug.collisionAlpha);
    wallsLayer.renderDebug(debugGraphics, {
      tileColor: null,
      collidingTileColor: new Phaser.Display.Color(243, 234, 48, 255),
      faceColor: new Phaser.Display.Color(40, 39, 37, 255),
    });
  }
}
