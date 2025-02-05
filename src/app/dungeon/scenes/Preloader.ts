export class Preloader extends Phaser.Scene {
  constructor() {
    super('preloader');
  }

  preload(): void {
    this.load.image('tiles', 'assets/dungeon/tiles/dungeon_tiles.png');
    this.load.tilemapTiledJSON('dungeon', 'assets/dungeon/tiles/dungeon-01.json');
  }

  create() : void {
    this.scene.start('game')
  }
}
