export class Game extends Phaser.Scene {
  constructor() {
    super('game');
  }

  preload(): void {

  }

  create() : void {
    const gameMap = this.make.tilemap({key: 'dungeon'});
    const tileSet = gameMap.addTilesetImage('dungeon', 'tiles');

    gameMap.createLayer('Ground',(tileSet as Phaser.Tilemaps.Tileset), 0, 0);
    const wallsLayer = gameMap.createLayer('Walls',(tileSet as Phaser.Tilemaps.Tileset), 0, 0);
    wallsLayer?.setCollisionByProperty({collides: true});

    // debug collision layout
    const debugGraphics = this.add.graphics().setAlpha(0.7);
    wallsLayer?.renderDebug(debugGraphics, {
      tileColor: null,
      collidingTileColor: new Phaser.Display.Color(243, 234,48, 255),
      faceColor: new Phaser.Display.Color(40, 39, 37, 255),
    })
  }
}
