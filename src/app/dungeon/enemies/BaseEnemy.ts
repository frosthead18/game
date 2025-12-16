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
  private moveEvent?: Phaser.Time.TimerEvent;
  private _level: number;
  private _health!: number;
  private _maxHealth!: number;
  private _damage!: number;
  private _speed!: number;
  private _enemyType: EnemyType;
  private _config: EnemyConfig;
  private _animationStarted = false;
  private _isAggressive = false;
  private _isReturningToSpawn = false;
  private _aggroRadius: number;
  private _leashRadius: number;
  private _spawnPosition: Phaser.Math.Vector2;
  private _isStationary: boolean;
  private _faune?: Phaser.Physics.Arcade.Sprite;

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

    // Initialize aggro/leash properties
    this._aggroRadius = this._config.aggroRadius ?? 0;
    this._leashRadius = this._config.leashRadius ?? (this._aggroRadius * 2);
    this._spawnPosition = new Phaser.Math.Vector2(x, y);
    this._isStationary = this._config.isStationary ?? false;

    scene.physics.world.on(Phaser.Physics.Arcade.Events.TILE_COLLIDE, this.handleTileCollision, this);

    // Only create movement timer if not stationary or has aggro radius
    if (!this._isStationary || this._aggroRadius > 0) {
      // If stationary with aggro, we'll create the timer when aggressive
      if (!this._isStationary) {
        this.createMovementTimer();
      }
    }
  }

  /**
   * Initialize the enemy after it's been added to the scene
   */
  public init(): void {
    const texture = this.scene.textures.get(this._enemyType);

    if (!texture || texture.key === '__MISSING') {
      console.error(`[BaseEnemy] Texture '${this._enemyType}' not found!`);
      return;
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
      if (this._isStationary && !this._isAggressive) {
        this.playIdleAnimation();
      } else {
        this.playRunAnimation();
      }
    }

    // Update aggro state if we have a faune reference and aggro radius
    if (this._faune && this._aggroRadius > 0) {
      this.updateAggroState();
    }

    // Update movement based on aggro state
    if (this._isReturningToSpawn) {
      // Returning to spawn position
      this.updateReturnToSpawn();
    } else if (this._isStationary && !this._isAggressive) {
      // Stationary and not aggressive - don't move
      this.setVelocity(0, 0);
    } else if (this._isAggressive) {
      // Aggressive - chase player
      this.updateAggressiveMovement();
    } else {
      // Normal wandering behavior
      this.updateMovement();
    }
  }

  override destroy(fromScene?: boolean): void {
    if (this.moveEvent) {
      this.moveEvent.destroy();
    }
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

  get isAggressive(): boolean {
    return this._isAggressive;
  }

  public setFaune(faune: Phaser.Physics.Arcade.Sprite): void {
    this._faune = faune;
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
      // Stop all movement and aggression when dead
      this._isAggressive = false;
      this.setVelocity(0, 0);
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
    
    if (!this.scene.anims.exists(animKey)) {
      console.error(`[BaseEnemy] Animation '${animKey}' does not exist in scene for ${this._enemyType}!`);
      return;
    }
    
    this.anims.play(animKey, true);
  }

  protected playIdleAnimation(): void {
    const animationType = this._config.animationType;
    
    // Simple animations only have one animation, so use that
    if (animationType === 'simple') {
      const animKey = `${this._enemyType}_anim`;
      if (this.scene.anims.exists(animKey)) {
        this.anims.play(animKey, true);
      }
      return;
    }
    
    // Standard and advanced have idle animations
    const animKey = `${this._enemyType}_idle`;
    if (this.scene.anims.exists(animKey)) {
      this.anims.play(animKey, true);
    }
  }

  private createMovementTimer(): void {
    if (this.moveEvent) {
      return; // Already exists
    }
    
    this.moveEvent = this.scene.time.addEvent({
      delay: GAME_CONFIG.lizard.directionChangeDelay,
      loop: true,
      callback: () => {
        this.direction = getRandomDirection(this.direction);
      }
    });
  }

  private destroyMovementTimer(): void {
    if (this.moveEvent) {
      this.moveEvent.destroy();
      this.moveEvent = undefined;
    }
  }

  private updateAggroState(): void {
    if (!this._faune) {
      return;
    }

    // Check if Faune is dead - if so, become passive
    const faune = this._faune as any;
    if (faune.health !== undefined && faune.health <= 0) {
      if (this._isAggressive) {
        this._isAggressive = false;
        
        // If originally stationary, start returning to spawn
        if (this._isStationary) {
          this.destroyMovementTimer();
          this._isReturningToSpawn = true;
          this.playRunAnimation();
        } else {
          this.setVelocity(0, 0);
        }
      }
      return;
    }

    const distanceToPlayer = Phaser.Math.Distance.Between(
      this.x, this.y,
      this._faune.x, this._faune.y
    );

    const distanceFromSpawn = Phaser.Math.Distance.Between(
      this.x, this.y,
      this._spawnPosition.x, this._spawnPosition.y
    );

    // Check if should become aggressive
    if (!this._isAggressive && distanceToPlayer <= this._aggroRadius) {
      this._isAggressive = true;
      
      // If was stationary, start moving now
      if (this._isStationary) {
        this.createMovementTimer();
      }
      
      // Switch to run animation
      this.playRunAnimation();
    }
    // Check if should return to passive (leash)
    else if (this._isAggressive && distanceFromSpawn > this._leashRadius) {
      this._isAggressive = false;
      
      // If originally stationary, start returning to spawn
      if (this._isStationary) {
        this.destroyMovementTimer();
        this._isReturningToSpawn = true;
        this.playRunAnimation();
      }
    }
  }

  private updateAggressiveMovement(): void {
    if (!this._faune) {
      return;
    }

    // Calculate direction to player
    const dx = this._faune.x - this.x;
    const dy = this._faune.y - this.y;
    
    // Normalize and scale by speed
    const direction = new Phaser.Math.Vector2(dx, dy).normalize();
    this.setVelocity(direction.x * this._speed, direction.y * this._speed);
    
    // Update facing direction
    if (dx < 0) {
      this.setFlipX(true);
    } else if (dx > 0) {
      this.setFlipX(false);
    }
  }

  private updateReturnToSpawn(): void {
    const distanceToSpawn = Phaser.Math.Distance.Between(
      this.x, this.y,
      this._spawnPosition.x, this._spawnPosition.y
    );

    // If close enough to spawn, stop and become idle
    if (distanceToSpawn < 5) {
      this._isReturningToSpawn = false;
      this.x = this._spawnPosition.x;
      this.y = this._spawnPosition.y;
      this.setVelocity(0, 0);
      this.playIdleAnimation();
      return;
    }

    // Calculate direction to spawn
    const dx = this._spawnPosition.x - this.x;
    const dy = this._spawnPosition.y - this.y;
    
    // Normalize and scale by speed
    const direction = new Phaser.Math.Vector2(dx, dy).normalize();
    this.setVelocity(direction.x * this._speed, direction.y * this._speed);
    
    // Update facing direction
    if (dx < 0) {
      this.setFlipX(true);
    } else if (dx > 0) {
      this.setFlipX(false);
    }
  }

  public getXpReward(): number {
    return this._config.baseXp * this._level;
  }
}

