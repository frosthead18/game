import TilemapLayer = Phaser.Tilemaps.TilemapLayer;
import ArcadeColliderType = Phaser.Types.Physics.Arcade.ArcadeColliderType;
import {createAllNPCAnimations} from "../npc/npc-animations";
import {createAllCharacterAnimations} from "../characters/character-animations";
import {createChestAnimations} from "../items/chest-animations";
import {BaseNPC} from "../npc/BaseNPC";
import {NPCFactory} from "../npc/NPCFactory";
import {CharacterFactory} from "../characters/CharacterFactory";
import {Faune} from "../characters/faune/Faune";
import {Chest} from "../items/Chest";
import {ASSET_KEYS, GAME_CONFIG, SCENE_KEYS, NPCType, CharacterType} from "../constants";
import {sceneEvents, EVENTS} from "../events/EventsCenter";
import {debugDraw} from "../utils/debug";
import {DamageCalculator} from "../utils/damage-calculator";

export class Game extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  public faune!: Faune;
  private enemies!: Phaser.Physics.Arcade.Group;
  private knives!: Phaser.Physics.Arcade.Group;
  private chests!: Phaser.Physics.Arcade.StaticGroup;
  private corpses!: Phaser.GameObjects.Group;
  private playerEnemiesCollider?: Phaser.Physics.Arcade.Collider;
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
    this.createCorpses();
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
    const desertTileSet = this.tilemap.addTilesetImage('dessert_dungeon', ASSET_KEYS.desertTiles);

    if (!tileSet || !desertTileSet) {
      console.error('Failed to load tileset');
      return null;
    }

    const tileSets = [tileSet, desertTileSet];
    this.tilemap.createLayer('Ground', tileSets, 0, 0);
    this.wallsLayer = this.tilemap.createLayer('Walls', tileSets, 0, 0);
    this.wallsLayer?.setCollisionByProperty({collides: true});

    // Uncomment to debug collision layout
    // if (this.wallsLayer) {
    //   debugDraw(this.wallsLayer, this);
    // }

    return this.wallsLayer;
  }

  private createAnimations(): void {
    createAllCharacterAnimations(this.anims);
    createAllNPCAnimations(this.anims);
    createChestAnimations(this.anims);
  }

  private createPlayer(): void {
    this.faune = CharacterFactory.createCharacter(
      this,
      GAME_CONFIG.player.startX,
      GAME_CONFIG.player.startY,
      CharacterType.FAUNE
    ) as Faune;

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

  private createCorpses(): void {
    this.corpses = this.add.group();
  }

  private createEnemies(): void {
    this.enemies = this.physics.add.group({
      classType: BaseNPC,
      createCallback: (gameObject: Phaser.GameObjects.GameObject) => {
        const enemy = gameObject as BaseNPC;
        if (enemy.body) {
          enemy.body.onCollide = true;
        }
      }
    });

    // Define enemy type weights for varied spawning
    // Higher numbers = more common
    const enemyWeights: Partial<Record<NPCType, number>> = {
      [NPCType.GOBLIN]: 5,
      [NPCType.IMP]: 5,
      [NPCType.SKELET]: 4,
      [NPCType.ZOMBIE]: 4,
      [NPCType.SLUG]: 3,
      [NPCType.LIZARD_M]: 3,
      [NPCType.MASKED_ORC]: 2,
      [NPCType.CHORT]: 2,
      [NPCType.OGRE]: 1,
      [NPCType.KNIGHT_M]: 1,
      [NPCType.KNIGHT_F]: 1
    };

    // Spawn multiple enemies at random positions
    const spawnPositions: { x: number; y: number }[] = [];

    for (let i = 0; i < GAME_CONFIG.lizard.spawnCount; i++) {
      const position = this.getRandomSpawnPosition(spawnPositions);

      if (position) {
        spawnPositions.push(position);

        // Get a random enemy type based on weights
        const enemyType = NPCFactory.getWeightedRandomNPCType(enemyWeights);

        // Create enemy using factory
        const enemy = NPCFactory.createNPC(this, position.x, position.y, enemyType);

        // Pass Faune reference for aggro system
        enemy.setFaune(this.faune);

        // Add to group
        this.enemies.add(enemy);
        enemy.setActive(true);
        enemy.setVisible(true);
      } else {
        console.warn(`[Game] Failed to find valid spawn position for enemy ${i + 1}`);
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
    this.physics.add.collider(this.enemies, wallsLayer as ArcadeColliderType);

    // Player-enemy collision with damage handling
    this.playerEnemiesCollider = this.physics.add.collider(
      this.faune,
      this.enemies,
      this.handlePlayerEnemyCollision,
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

    // Knife-enemy collision
    this.physics.add.collider(
      this.knives,
      this.enemies,
      this.handleKnifeEnemyCollision,
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

  private handlePlayerEnemyCollision(
    object1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile,
    object2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile
  ): void {
    const enemy = object2 as BaseNPC;

    // Only apply damage if enemy is aggressive and alive
    if (!enemy.isAggressive || enemy.health <= 0) {
      return;
    }

    const dx = this.faune.x - enemy.x;
    const dy = this.faune.y - enemy.y;

    const dir = new Phaser.Math.Vector2(dx, dy).normalize().scale(GAME_CONFIG.player.knockbackSpeed);

    // Calculate damage using the new system
    const damageResult = enemy.calculateAttackDamage(this.faune.getCombatStats());
    
    console.log(`[Game] Enemy ${enemy.npcType} L${enemy.level} attacks for ${damageResult.totalDamage} damage` +
                `${damageResult.isCritical ? ' CRITICAL!' : ''}`);
    
    // Apply damage to player
    this.faune.handleDamage(dir, damageResult.totalDamage);

    // Show critical hit text if applicable
    if (damageResult.isCritical) {
      const critText = this.add.text(this.faune.x, this.faune.y - 20, 'CRITICAL!', {
        fontSize: '16px',
        color: '#ff0000',
        fontStyle: 'bold'
      });
      this.tweens.add({
        targets: critText,
        y: critText.y - 30,
        alpha: 0,
        duration: 1000,
        onComplete: () => critText.destroy()
      });
    }

    if (this.faune.health <= 0) {
      // Stop player-enemy collisions when dead
      this.playerEnemiesCollider?.destroy();
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

  private handleKnifeEnemyCollision(
    object1: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile,
    object2: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile
  ): void {
    const knife = object1 as Phaser.Physics.Arcade.Image;
    const enemy = object2 as BaseNPC;

    // Always destroy the knife on hit
    knife.destroy();

    // Calculate player's attack damage
    const damageResult = DamageCalculator.calculateDamage(
      this.faune.getCombatStats(),
      enemy.getCombatStats(),
      0.1  // 10% variation for knife attacks
    );

    console.log(`[Game] Player L${this.faune.level} knife hits ${enemy.npcType} L${enemy.level} for ${damageResult.totalDamage} damage` +
                `${damageResult.isCritical ? ' CRITICAL!' : ''}`);

    // Apply damage to enemy and only destroy if health reaches 0
    const isAlive = enemy.takeDamage(damageResult.totalDamage);
    
    // Show damage number
    this.showDamageNumber(enemy.x, enemy.y, damageResult.totalDamage, damageResult.isCritical);

    if (!isAlive) {
      // Award XP to player
      const xpReward = enemy.getXpReward();
      this.faune.gainXp(xpReward);

      // Create corpse sprite before destroying enemy
      this.createCorpse(enemy);

      // Destroy enemy
      enemy.destroy();
    }
  }

  private createCorpse(enemy: BaseNPC): void {
    // Create corpse sprite at enemy position
    const corpse = this.add.sprite(
      enemy.x,
      enemy.y,
      enemy.texture.key,
      enemy.frame.name
    );

    // Copy enemy properties
    corpse.setScale(enemy.scaleX, enemy.scaleY);
    corpse.setFlipX(enemy.flipX);

    // Apply gray tint to indicate death
    corpse.setTint(0x888888);

    // Set depth below living entities
    corpse.setDepth(0);

    // Add to corpses group
    this.corpses.add(corpse);
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

  private showDamageNumber(x: number, y: number, damage: number, isCritical: boolean): void {
    const color = isCritical ? '#ff0000' : '#ffffff';
    const fontSize = isCritical ? '18px' : '14px';
    
    const damageText = this.add.text(x, y - 10, damage.toString(), {
      fontSize: fontSize,
      color: color,
      fontStyle: isCritical ? 'bold' : 'normal',
      stroke: '#000000',
      strokeThickness: 2
    });
    
    this.tweens.add({
      targets: damageText,
      y: damageText.y - 40,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => damageText.destroy()
    });
  }
}
