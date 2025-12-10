import {ASSET_KEYS, ASSET_PATHS, SCENE_KEYS, EnemyType} from "../constants";

export class Preloader extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.preloader);
  }

  preload(): void {
    this.loadTilemap();
    this.loadCharacters();
    this.loadEnemies();
    this.loadItems();
    this.loadWeapons();
    this.loadUI();
  }

  create(): void {
    this.scene.start(SCENE_KEYS.game);
  }

  private loadTilemap(): void {
    this.load.image(ASSET_KEYS.tiles, ASSET_PATHS.tiles.image);
    this.load.tilemapTiledJSON(ASSET_KEYS.dungeon, ASSET_PATHS.tiles.json);
  }

  private loadCharacters(): void {
    this.load.atlas(
      ASSET_KEYS.faune,
      ASSET_PATHS.characters.faune.image,
      ASSET_PATHS.characters.faune.atlas
    );
  }

  private loadEnemies(): void {
    // Load all enemy types
    Object.values(EnemyType).forEach(enemyType => {
      const enemyPath = ASSET_PATHS.enemies[enemyType as keyof typeof ASSET_PATHS.enemies];
      if (enemyPath) {
        this.load.atlas(
          enemyType,
          enemyPath.image,
          enemyPath.atlas
        );
      }
    });
  }

  private loadItems(): void {
    this.load.atlas(
      ASSET_KEYS.treasure,
      ASSET_PATHS.items.treasure.image,
      ASSET_PATHS.items.treasure.atlas
    );
  }

  private loadWeapons(): void {
    this.load.image(ASSET_KEYS.knife, ASSET_PATHS.weapons.knife.image);
  }

  private loadUI(): void {
    this.load.image('ui-heart-empty', 'assets/dungeon/ui/ui_heart_empty.png');
    this.load.image('ui-heart-full', 'assets/dungeon/ui/ui_heart_full.png');
  }
}
