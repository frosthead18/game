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
  private tilemap!: Phaser.Tilemaps.Tilemap;
  private wallsLayer!: TilemapLayer | null;

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
    this.tilemap = this.make.tilemap({key: ASSET_KEYS.dungeon});
    const tileSet = this.tilemap.addTilesetImage(ASSET_KEYS.dungeon, ASSET_KEYS.tiles);

    if (!tileSet) {
      console.error('Failed to load tileset');
      return null;
    }

    this.tilemap.createLayer('Ground', tileSet, 0, 0);
    this.wallsLayer = this.tilemap.createLayer('Walls', tileSet, 0, 0);
    this.wallsLayer?.setCollisionByProperty({collides: true});

    // Uncomment to debug collision layout
    // if (this.wallsLayer) {
    //   debugDraw(this.wallsLayer, this);
    // }

    return this.wallsLayer;
  }

  private createAnimations(): void {
    createFauneAnimations(this.anims);
    createLizardAnimations(this.anims);
    createChestAnimations(this.anims);
  }

  private createPlayer(): void {
    this.faune = this.add.faune(128, 128, ASSET_KEYS.faune);
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

    // Spawn multiple lizards at random positions
    const spawnPositions: { x: number; y: number }[] = [];
    
    for (let i = 0; i < GAME_CONFIG.lizard.spawnCount; i++) {
      const position = this.getRandomSpawnPosition(spawnPositions);
      
      if (position) {
        spawnPositions.push(position);
        const lizard = this.lizards.create(position.x, position.y, ASSET_KEYS.lizard) as Lizard;
        lizard.setActive(true);
        lizard.setVisible(true);
      } else {
        console.warn(`[Game] Failed to find valid spawn position for lizard ${i + 1}`);
      }
    }
  }

  private getRandomSpawnPosition(existingPositions: { x: number; y: number }[]): { x: number; y: number } | null {
    const config = GAME_CONFIG.lizard;
    const margin = config.spawnAreaMargin;
    
    // Use actual tilemap dimensions in pixels
    const mapWidth = this.tilemap.widthInPixels;
    const mapHeight = this.tilemap.heightInPixels;
    
    const minX = margin;
    const maxX = mapWidth - margin;
    const minY = margin;
    const maxY = mapHeight - margin;

    for (let attempt = 0; attempt < config.maxSpawnAttempts; attempt++) {
      const x = Phaser.Math.Between(minX, maxX);
      const y = Phaser.Math.Between(minY, maxY);

      // Check if this position is on a walkable tile (not a wall)
      if (this.wallsLayer) {
        const tile = this.wallsLayer.getTileAtWorldXY(x, y);
        if (tile && tile.collides) {
          // Position is on a wall, skip it
          continue;
        }
      }

      // Check if this position is far enough from all existing positions
      let validPosition = true;
      for (const existing of existingPositions) {
        const distance = Phaser.Math.Distance.Between(x, y, existing.x, existing.y);
        if (distance < config.minSpawnDistance) {
          validPosition = false;
          break;
        }
      }

      if (validPosition) {
        return { x, y };
      }
    }

    // Failed to find a valid position after max attempts
    return null;
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
    const knife = object1 as Phaser.Physics.Arcade.Image;
    const lizard = object2 as Lizard;

    // Always destroy the knife on hit
    knife.destroy();

    // Apply damage to lizard and only destroy if health reaches 0
    const isAlive = lizard.takeDamage(GAME_CONFIG.knife.damage);
    if (!isAlive) {
      lizard.destroy();
    }
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
