import TilemapLayer = Phaser.Tilemaps.TilemapLayer;
import ArcadeColliderType = Phaser.Types.Physics.Arcade.ArcadeColliderType;
import {createLizardAnimations} from "../enemies/lizard/lizard-animations";
import {createFauneAnimations} from "../characters/faune/faune-animations";
import {createChestAnimations} from "../items/chest-animations";
import {Lizard} from "../enemies/lizard/Lizard";
import '../characters/faune/Faune'
import {Faune} from "../characters/faune/Faune";
import {Chest} from "../items/Chest";
import {ASSET_KEYS, GAME_CONFIG, SCENE_KEYS} from "../constants";
import {sceneEvents, EVENTS} from "../events/EventsCenter";
import {debugDraw} from "../utils/debug";

export class Game extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private faune!: Faune;
  private lizards!: Phaser.Physics.Arcade.Group;
  private knives!: Phaser.Physics.Arcade.Group;
  private chests!: Phaser.Physics.Arcade.StaticGroup;
  private playerLizardsCollider?: Phaser.Physics.Arcade.Collider;
  private isOverlappingChest = false;

  constructor() {
    super(SCENE_KEYS.game);
  }

  preload(): void {
    this.cursors = this.input.keyboard?.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;
  }

  create(): void {
    // Start the UI scene
    this.scene.run(SCENE_KEYS.gameUI);

    const wallsLayer = this.createMap();
    this.createAnimations();
    this.createPlayer();
    this.createChests();
    this.createEnemies();
    this.createKnives();
    this.setupCollisions(wallsLayer);
    this.setupCamera();
  }

  override update(time: number, delta: number): void {
    // Clear chest overlap flag at start of frame
    // Will be set back to true by overlap callback if still overlapping
    if (!this.isOverlappingChest) {
      this.faune.clearChest();
    }
    this.isOverlappingChest = false;
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
    // if (wallsLayer) {
    //   debugDraw(wallsLayer, this);
    // }

    return wallsLayer;
  }

  private createAnimations(): void {
    createFauneAnimations(this.anims);
    createLizardAnimations(this.anims);
    createChestAnimations(this.anims);
  }

  private createPlayer(): void {
    this.faune = this.add.faune(128, 128, 'faune');
    this.faune.setCursors(this.cursors);
  }

  private createChests(): void {
    this.chests = this.physics.add.staticGroup({
      classType: Chest
    });

    // Create some chests at specific positions
    this.chests.get(32, 188, ASSET_KEYS.treasure);
    this.chests.get(616, 284, ASSET_KEYS.treasure);
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

  private createKnives(): void {
    this.knives = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      maxSize: 10
    });

    this.faune.setKnives(this.knives);
  }

  private setupCollisions(wallsLayer: TilemapLayer | null): void {
    if (!wallsLayer) {
      return;
    }

    // Wall collisions
    this.physics.add.collider(this.faune, wallsLayer as ArcadeColliderType);
    this.physics.add.collider(this.lizards, wallsLayer as ArcadeColliderType);

    // Player-lizard collision with damage handling
    this.playerLizardsCollider = this.physics.add.collider(
      this.faune,
      this.lizards,
      this.handlePlayerLizardCollision,
      undefined,
      this
    );

    // Chest overlap (no collision so player can overlap and interact)
    this.physics.add.overlap(
      this.faune,
      this.chests,
      this.handlePlayerChestOverlap,
      undefined,
      this
    );

    // Knife-lizard collision
    this.physics.add.collider(
      this.knives,
      this.lizards,
      this.handleKnifeLizardCollision,
      undefined,
      this
    );

    // Knife-wall collision
    this.physics.add.collider(
      this.knives,
      wallsLayer as ArcadeColliderType,
      this.handleKnifeWallCollision,
      undefined,
      this
    );
  }

  private handlePlayerLizardCollision(
    object1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile,
    object2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile
  ): void {
    const lizard = object2 as Lizard;

    const dx = this.faune.x - lizard.x;
    const dy = this.faune.y - lizard.y;

    const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(GAME_CONFIG.player.knockbackSpeed);

    this.faune.handleDamage(dir);

    sceneEvents.emit(EVENTS.PLAYER_HEALTH_CHANGED, this.faune.health);

    if (this.faune.health <= 0) {
      // Stop player-lizard collisions when dead
      this.playerLizardsCollider?.destroy();
    }
  }

  private handlePlayerChestOverlap(
    object1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile,
    object2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile
  ): void {
    const chest = object2 as Chest;
    console.log('[Game] Player overlapping with chest, setting active chest');
    this.isOverlappingChest = true;
    this.faune.setChest(chest);
  }

  private handleKnifeLizardCollision(
    object1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile,
    object2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile
  ): void {
    // Destroy knife and lizard on hit
    const knife = object1 as Phaser.Physics.Arcade.Image;
    const lizard = object2 as Lizard;

    knife.destroy();
    lizard.destroy();
  }

  private handleKnifeWallCollision(
    object1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile,
    object2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile
  ): void {
    // Destroy knife when it hits a wall
    const knife = object1 as Phaser.Physics.Arcade.Image;
    knife.destroy();
  }

  private setupCamera(): void {
    this.cameras.main.startFollow(this.faune, true);
  }
}
