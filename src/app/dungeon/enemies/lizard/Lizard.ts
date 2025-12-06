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
  private _level: number;
  private _health!: number;
  private _maxHealth!: number;
  private _damage!: number;
  private _speed!: number;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number, level?: number) {
    super(scene, x, y, texture, frame);

    // Clamp level between min and max
    this._level = Phaser.Math.Clamp(
      level ?? GAME_CONFIG.lizard.defaultLevel,
      GAME_CONFIG.lizard.minLevel,
      GAME_CONFIG.lizard.maxLevel
    );

    // Calculate stats based on level
    this.calculateStats();

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

  get level(): number {
    return this._level;
  }

  get health(): number {
    return this._health;
  }

  get maxHealth(): number {
    return this._maxHealth;
  }

  get damage(): number {
    return this._damage;
  }

  private calculateStats(): void {
    const config = GAME_CONFIG.lizard;
    
    // HP = level * hpScaleFactor, rounded up (minimum 1)
    this._maxHealth = Math.ceil(this._level * config.hpScaleFactor);
    this._health = this._maxHealth;
    
    // Damage = baseDamage * level
    this._damage = config.baseDamage * this._level;
    
    // Speed = baseSpeed * (1 + (level - 1) * speedScaleFactor)
    this._speed = config.baseSpeed * (1 + (this._level - 1) * config.speedScaleFactor);
  }

  public takeDamage(amount: number): boolean {
    this._health -= amount;

    // Flash red briefly to indicate damage
    this.setTint(0xff0000);
    this.scene.time.delayedCall(150, () => {
      this.clearTint();
    });

    // Return false if dead, true if still alive
    if (this._health <= 0) {
      return false;
    }

    return true;
  }

  private updateMovement(): void {
    switch (this.direction) {
      case Directions.UP:
        this.setVelocity(0, -this._speed);
        break;

      case Directions.DOWN:
        this.setVelocity(0, this._speed);
        break;

      case Directions.RIGHT:
        this.setVelocity(this._speed, 0);
        this.setFlipX(false);
        break;

      case Directions.LEFT:
        this.setVelocity(-this._speed, 0);
        this.setFlipX(true);
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

