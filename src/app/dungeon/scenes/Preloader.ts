export class Preloader extends Phaser.Scene {
  constructor() {
    super('preloader');
  }

  preload(): void {
    this.load.image('tiles', 'assets/dungeon/tiles/dungeon_tiles.png');
    this.load.tilemapTiledJSON('dungeon', 'assets/dungeon/tiles/dungeon-01.json');

    this.load.atlas('faune', 'assets/dungeon/characters/fauna.png', 'assets/dungeon/characters/fauna.json');
    this.load.atlas('lizard', 'assets/dungeon/enemies/lizard.png', 'assets/dungeon/enemies/lizard.json');
  }

  create() : void {
    this.scene.start('game')
  }
}
