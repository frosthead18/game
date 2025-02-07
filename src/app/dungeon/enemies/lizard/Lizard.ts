import {LizardMovement} from "./lizard-animations";

export enum Directions {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

const getRandomDirection = (exclude: Directions) => {
  let lizardDirection = Phaser.Math.Between(0,3);

  while (lizardDirection === exclude) {
    lizardDirection = Phaser.Math.Between(0,3);
  }

  return lizardDirection;
}

export class Lizard extends Phaser.Physics.Arcade.Sprite {
  private lizardDirection: Directions = Directions.LEFT;
  private moveEvent: Phaser.Time.TimerEvent;

  constructor(screen: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
    super(screen, x, y, texture, frame);

    this.anims.play(LizardMovement.run);

    screen.physics.world.on(Phaser.Physics.Arcade.Events.TILE_COLLIDE, this.handleTileCollision, this);

    this.moveEvent = screen.time.addEvent({
      delay: 2000,
      loop: true,
      callback: () => {
        this.lizardDirection = getRandomDirection(this.lizardDirection);
      }
    })
  }

  override preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);

    const speed = 50;

    switch (this.lizardDirection) {
      case Directions.UP:
        this.setVelocity(0, -speed);
        break

      case Directions.DOWN:
        this.setVelocity(0, speed)
        break

      case Directions.RIGHT:
        this.setVelocity(speed, 0)
        break

      case Directions.LEFT:
        this.setVelocity(-speed, 0)
        break
    }
  }

  override destroy(fromScene?: boolean) {
    this.moveEvent.destroy();
    super.destroy(fromScene);
  }

  private handleTileCollision(gameObject: Phaser.GameObjects.GameObject, tile: Phaser.Tilemaps.Tile) {
    if (gameObject !== this) {
      return
    }

    this.lizardDirection = getRandomDirection(this.lizardDirection);
  }
}
