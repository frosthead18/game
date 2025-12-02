import {ASSET_KEYS, ASSET_PATHS, SCENE_KEYS} from "../constants";

export class Preloader extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.preloader);
  }

  preload(): void {
    this.loadTilemap();
    this.loadCharacters();
    this.loadEnemies();
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
    this.load.atlas(
      ASSET_KEYS.lizard,
      ASSET_PATHS.enemies.lizard.image,
      ASSET_PATHS.enemies.lizard.atlas
    );
  }
}
