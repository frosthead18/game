import {EnemyType, GAME_CONFIG, ENEMY_CONFIGS, EnemyConfig} from "../constants";

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

export class BaseEnemy extends Phaser.Physics.Arcade.Sprite {
  private direction: Directions = Directions.LEFT;
  private moveEvent: Phaser.Time.TimerEvent;
  private _level: number;
  private _health!: number;
  private _maxHealth!: number;
  private _damage!: number;
  private _speed!: number;
  private _enemyType: EnemyType;
  private _config: EnemyConfig;
  private _animationStarted = false;

  constructor(scene: Phaser.Scene, x: number, y: number, enemyType: EnemyType, frame?: string | number, level?: number) {
    super(scene, x, y, enemyType, frame);

    this._enemyType = enemyType;
    this._config = ENEMY_CONFIGS[enemyType];

    // Clamp level between min and max
    this._level = Phaser.Math.Clamp(
      level ?? GAME_CONFIG.lizard.defaultLevel,
      GAME_CONFIG.lizard.minLevel,
      GAME_CONFIG.lizard.maxLevel
    );

    // Apply scale if configured
    if (this._config.scale) {
      this.setScale(this._config.scale);
    }

    // Calculate stats based on level
    this.calculateStats();

    scene.physics.world.on(Phaser.Physics.Arcade.Events.TILE_COLLIDE, this.handleTileCollision, this);

    this.moveEvent = scene.time.addEvent({
      delay: GAME_CONFIG.lizard.directionChangeDelay,
      loop: true,
      callback: () => {
        this.direction = getRandomDirection(this.direction);
      }
    });
  }

  /**
   * Initialize the enemy after it's been added to the scene
   */
  public init(): void {
    console.log(`[BaseEnemy] Initializing ${this._enemyType} at (${this.x}, ${this.y})`);
    
    // Check if texture is loaded
    const texture = this.scene.textures.get(this._enemyType);
    if (!texture || texture.key === '__MISSING') {
      console.error(`[BaseEnemy] Texture '${this._enemyType}' not found!`);
      return;
    }
    
    const frameNames = texture.getFrameNames();
    console.log(`[BaseEnemy] Texture '${this._enemyType}' has ${frameNames.length} frames`);
    if (frameNames.length > 0) {
      console.log(`[BaseEnemy] First few frames:`, frameNames.slice(0, 5));
    }
    
    if (!this._animationStarted) {
      this._animationStarted = true;
      this.playRunAnimation();
    }
  }

  override preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    // Start animation on first update if not already started
    if (!this._animationStarted) {
      this._animationStarted = true;
      this.playRunAnimation();
    }

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

  get enemyType(): EnemyType {
    return this._enemyType;
  }

  protected calculateStats(): void {
    const config = this._config;
    
    // HP = baseHp * level * hpScaleFactor, rounded up (minimum 1)
    this._maxHealth = Math.ceil(config.baseHp * this._level * GAME_CONFIG.lizard.hpScaleFactor);
    this._health = this._maxHealth;
    
    // Damage = baseDamage * level
    this._damage = config.baseDamage * this._level;
    
    // Speed = baseSpeed * (1 + (level - 1) * speedScaleFactor)
    this._speed = config.baseSpeed * (1 + (this._level - 1) * GAME_CONFIG.lizard.speedScaleFactor);
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

  protected updateMovement(): void {
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

  protected playRunAnimation(): void {
    const animationType = this._config.animationType;
    const animKey = animationType === 'simple' ? `${this._enemyType}_anim` : `${this._enemyType}_run`;
    
    console.log(`[BaseEnemy] Playing animation '${animKey}' for ${this._enemyType}`);
    
    // Check if animation exists
    if (!this.anims.exists(animKey)) {
      console.error(`[BaseEnemy] Animation '${animKey}' does not exist for ${this._enemyType}!`);
      return;
    }
    
    const result = this.anims.play(animKey, true);
    
    console.log(`[BaseEnemy] Animation play result:`, result);
    console.log(`[BaseEnemy] Animation state - isPlaying:`, this.anims.isPlaying, 'currentAnim:', this.anims.currentAnim?.key);
    console.log(`[BaseEnemy] Sprite state - visible:`, this.visible, 'active:', this.active, 'texture:', this.texture.key);
  }
}

