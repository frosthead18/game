import {LizardMovement} from "./lizard-animations";
import {GAME_CONFIG} from "../../constants";

export enum Directions {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

const MIN_DIRECTION = 0;
const MAX_DIRECTION = 3;

const getRandomDirection = (exclude: Directions): Directions => {
  let newDirection = Phaser.Math.Between(MIN_DIRECTION, MAX_DIRECTION);

  while (newDirection === exclude) {
    newDirection = Phaser.Math.Between(MIN_DIRECTION, MAX_DIRECTION);
  }

  return newDirection;
};

export class Lizard extends Phaser.Physics.Arcade.Sprite {
  private direction: Directions = Directions.LEFT;
  private moveEvent: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
    super(scene, x, y, texture, frame);

    this.anims.play(LizardMovement.run);

    scene.physics.world.on(Phaser.Physics.Arcade.Events.TILE_COLLIDE, this.handleTileCollision, this);

    this.moveEvent = scene.time.addEvent({
      delay: GAME_CONFIG.lizard.directionChangeDelay,
      loop: true,
      callback: () => {
        this.direction = getRandomDirection(this.direction);
      }
    });
  }

  override preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    this.updateMovement();
  }

  override destroy(fromScene?: boolean): void {
    this.moveEvent.destroy();
    super.destroy(fromScene);
  }

  private updateMovement(): void {
    const speed = GAME_CONFIG.lizard.speed;

    switch (this.direction) {
      case Directions.UP:
        this.setVelocity(0, -speed);
        break;

      case Directions.DOWN:
        this.setVelocity(0, speed);
        break;

      case Directions.RIGHT:
        this.setVelocity(speed, 0);
        break;

      case Directions.LEFT:
        this.setVelocity(-speed, 0);
        break;
    }
  }

  private handleTileCollision(gameObject: Phaser.GameObjects.GameObject, tile: Phaser.Tilemaps.Tile): void {
    if (gameObject !== this) {
      return;
    }

    this.direction = getRandomDirection(this.direction);
  }
}

