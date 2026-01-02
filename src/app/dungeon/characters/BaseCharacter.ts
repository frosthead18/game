import {CharacterType, CHARACTER_CONFIGS, CharacterConfig, GAME_CONFIG, CombatStats} from "../constants";
import {sceneEvents, EVENTS} from "../events/EventsCenter";
import {Chest} from "../items/Chest";

export enum HealthState {
  IDLE,
  DAMAGE,
  DEAD
}

export class BaseCharacter extends Phaser.Physics.Arcade.Sprite {
  protected _characterType: CharacterType;
  protected _config: CharacterConfig;
  protected lastDirection: string = 'down';
  protected keyW?: Phaser.Input.Keyboard.Key;
  protected keyA?: Phaser.Input.Keyboard.Key;
  protected keyS?: Phaser.Input.Keyboard.Key;
  protected keyD?: Phaser.Input.Keyboard.Key;
  protected keyShift?: Phaser.Input.Keyboard.Key;
  protected keyF?: Phaser.Input.Keyboard.Key;
  protected keyE?: Phaser.Input.Keyboard.Key;
  protected healthState = HealthState.IDLE;
  protected damageTime = 0;
  protected _health!: number;
  protected _maxHealth!: number;
  protected _coins = 0;
  protected _level!: number;
  protected _xp!: number;
  protected _damage!: number;
  protected _defense!: number;
  protected knives?: Phaser.Physics.Arcade.Group;
  protected activeChest?: Chest;
  protected _energy: number;
  protected _maxEnergy: number;
  protected _lastEnergyUseTime: number = 0;
  protected _knifeCount: number;

  constructor(scene: Phaser.Scene, x: number, y: number, characterType: CharacterType, level?: number) {
    super(scene, x, y, characterType, undefined);
    
    this._characterType = characterType;
    this._config = CHARACTER_CONFIGS[characterType];
    
    // Initialize leveling stats
    this._level = level ?? GAME_CONFIG.player.level;
    this._xp = GAME_CONFIG.player.xp;
    
    // Calculate stats based on level and config
    this.calculateStats();
    
    // Initialize energy system
    this._maxEnergy = this._config.maxEnergy;
    this._energy = this._maxEnergy;
    
    // Initialize knife inventory
    this._knifeCount = this._config.maxKnifeCount;
  }

  setCursors(cursors: Phaser.Types.Input.Keyboard.CursorKeys): void {
    // Set up WASD and other keys
    if (this.scene.input.keyboard) {
      this.keyW = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      this.keyA = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.keyS = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
      this.keyD = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
      this.keyShift = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
      this.keyF = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
      this.keyE = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    }
  }

  setKnives(knives: Phaser.Physics.Arcade.Group): void {
    this.knives = knives;
  }

  setChest(chest: Chest): void {
    this.activeChest = chest;
  }

  clearChest(): void {
    this.activeChest = undefined;
  }

  get health(): number {
    return this._health;
  }

  get maxHealth(): number {
    return this._maxHealth;
  }

  get coins(): number {
    return this._coins;
  }

  get level(): number {
    return this._level;
  }

  get xp(): number {
    return this._xp;
  }

  get damage(): number {
    return this._damage;
  }

  get defense(): number {
    return this._defense;
  }

  get energy(): number {
    return this._energy;
  }

  get maxEnergy(): number {
    return this._maxEnergy;
  }

  get knifeCount(): number {
    return this._knifeCount;
  }

  get characterType(): CharacterType {
    return this._characterType;
  }

  override preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);

    // Handle energy regeneration
    this.handleEnergyRegeneration(time, delta);

    switch (this.healthState) {
      case HealthState.IDLE:
        this.handleMovement();
        break;

      case HealthState.DAMAGE:
        this.handleDamageState(time);
        break;

      case HealthState.DEAD:
        break;
    }
  }

  protected calculateStats(): void {
    // HP = baseMaxHealth + (level - 1) * healthPerLevel
    this._maxHealth = this._config.baseMaxHealth + (this._level - 1) * this._config.healthPerLevel;
    this._health = this._maxHealth;
    
    // Damage = baseDamage + (level - 1) * damagePerLevel
    this._damage = this._config.baseDamage + (this._level - 1) * this._config.damagePerLevel;
    
    // Defense = playerBaseDefense + (level - 1) * defensePerLevel
    this._defense = GAME_CONFIG.combat.playerBaseDefense + (this._level - 1) * GAME_CONFIG.combat.defensePerLevel;
  }

  protected getCurrentTime(): number {
    return this.scene.time.now;
  }

  protected handleMovement(): void {
    let moveX = 0;
    let moveY = 0;

    // Handle E key for chest opening
    if (this.keyE && Phaser.Input.Keyboard.JustDown(this.keyE)) {
      if (this.activeChest) {
        console.log('[BaseCharacter] E pressed, attempting to open chest');
        const loot = this.activeChest.open();
        
        if (loot) {
          console.log(`[BaseCharacter] Chest opened, received ${loot.coins} coins and ${loot.knives} knives`);
          
          // Add coins
          this._coins += loot.coins;
          sceneEvents.emit(EVENTS.PLAYER_COINS_CHANGED, this._coins);
          
          // Add knives (up to max)
          this._knifeCount = Math.min(this._config.maxKnifeCount, this._knifeCount + loot.knives);
          sceneEvents.emit(EVENTS.PLAYER_KNIFE_COUNT_CHANGED, this._knifeCount);
        } else {
          console.log('[BaseCharacter] Chest was already opened');
        }
      } else {
        console.log('[BaseCharacter] E pressed but no active chest');
      }
      return;
    }

    // Handle WASD movement
    if (this.keyA?.isDown) {
      moveX = -1;
      this.setFlipX(true);
      this.lastDirection = 'side';
    } else if (this.keyD?.isDown) {
      moveX = 1;
      this.setFlipX(false);
      this.lastDirection = 'side';
    }

    if (this.keyW?.isDown) {
      moveY = -1;
      this.lastDirection = 'up';
    } else if (this.keyS?.isDown) {
      moveY = 1;
      this.lastDirection = 'down';
    }

    // Check if sprinting
    const isSprinting = this.keyShift?.isDown && (moveX !== 0 || moveY !== 0) && this._energy > 0;
    let speed = this._config.baseSpeed;

    if (isSprinting) {
      speed *= this._config.sprintSpeedMultiplier;
      this.consumeEnergy(this._config.sprintCostPerFrame);
    }

    // Update animation
    if (moveX !== 0 || moveY !== 0) {
      this.playRunAnimation();
    } else {
      this.playIdleAnimation();
    }

    this.setVelocity(moveX * speed, moveY * speed);

    // Handle knife throwing with F key
    if (this.keyF && Phaser.Input.Keyboard.JustDown(this.keyF)) {
      this.throwKnife();
    }
  }

  protected playIdleAnimation(): void {
    const idleKey = `${this._characterType}_idle_${this.lastDirection}`;
    this.anims.play(idleKey, true);
  }

  protected playRunAnimation(): void {
    const runKey = `${this._characterType}_run_${this.lastDirection}`;
    this.anims.play(runKey, true);
  }

  protected handleDamageState(time: number): void {
    if (this.damageTime > time) {
      return;
    }

    console.log(`[BaseCharacter] Exiting DAMAGE state at ${time}, returning to IDLE`);
    this.healthState = HealthState.IDLE;
    this.setTint(0xffffff);
  }

  protected throwKnife(): void {
    if (!this.knives) {
      return;
    }

    // Check if we have knives available
    if (this._knifeCount <= 0) {
      console.log('[BaseCharacter] No knives available');
      return;
    }

    // Check if we have enough energy
    if (this._energy < this._config.knifeCost) {
      console.log('[BaseCharacter] Not enough energy to throw knife');
      return;
    }

    const knife = this.knives.get(this.x, this.y, 'knife') as Phaser.Physics.Arcade.Image;
    if (!knife) {
      return;
    }

    // Consume knife and energy
    this._knifeCount--;
    sceneEvents.emit(EVENTS.PLAYER_KNIFE_COUNT_CHANGED, this._knifeCount);
    this.consumeEnergy(this._config.knifeCost);

    // Determine throw direction based on player's facing direction
    const vec = new Phaser.Math.Vector2(0, 0);

    switch (this.lastDirection) {
      case 'up':
        vec.y = -1;
        break;
      case 'down':
        vec.y = 1;
        break;
      default:
      case 'side':
        if (this.flipX) {
          vec.x = -1;
        } else {
          vec.x = 1;
        }
        break;
    }

    const angle = vec.angle();

    knife.setActive(true);
    knife.setVisible(true);
    knife.setRotation(angle);
    knife.setVelocity(vec.x * GAME_CONFIG.knife.speed, vec.y * GAME_CONFIG.knife.speed);
    
    // Add rotation to the knife
    knife.setAngularVelocity(GAME_CONFIG.knife.rotationSpeed);
  }

  public handleDamage(dir: Phaser.Math.Vector2, damageAmount?: number): void {
    if (this._health <= 0) {
      return;
    }

    if (this.healthState === HealthState.DAMAGE) {
      return;
    }

    // Use provided damage amount or default to 1
    const actualDamage = damageAmount ?? 1;
    
    // Apply defense
    const finalDamage = Math.max(1, Math.round(actualDamage - this._defense));
    
    this._health -= finalDamage;
    console.log(`[BaseCharacter] Took ${finalDamage} damage (${actualDamage} before defense)`);
    
    sceneEvents.emit(EVENTS.PLAYER_HEALTH_CHANGED, this._health, this._maxHealth);

    if (this._health <= 0) {
      console.log('[BaseCharacter] Player DEAD');
      this.healthState = HealthState.DEAD;
      this.playFaintAnimation();
      this.setVelocity(0, 0);
      sceneEvents.emit(EVENTS.PLAYER_DIED);
    } else {
      const currentTime = this.getCurrentTime();
      this.damageTime = currentTime + this._config.damageTimeDelay;
      this.healthState = HealthState.DAMAGE;

      console.log(`[BaseCharacter] Entering DAMAGE state at ${currentTime}, will exit at ${this.damageTime}`);
      
      this.setVelocity(dir.x, dir.y);
      this.setTint(0xff0000);
      
      // Add screen shake for heavy hits (damage > 3)
      if (finalDamage > 3) {
        this.scene.cameras.main.shake(100, 0.005);
      }
    }
  }

  protected playFaintAnimation(): void {
    const faintKey = `${this._characterType}_faint_down`;
    this.anims.play(faintKey, true);
  }

  public gainXp(amount: number): void {
    this._xp += amount;
    console.log(`[BaseCharacter] Gained ${amount} XP, total: ${this._xp}`);
    
    // Emit XP changed event
    sceneEvents.emit(EVENTS.PLAYER_XP_CHANGED, this._xp, this.getXpForNextLevel());
    
    // Check for level up
    while (this._xp >= this.getXpForNextLevel()) {
      this.levelUp();
    }
  }

  protected levelUp(): void {
    // Deduct XP for level up
    this._xp -= this.getXpForNextLevel();
    this._level++;
    
    // Recalculate stats
    this._maxHealth = this._config.baseMaxHealth + (this._level - 1) * this._config.healthPerLevel;
    this._damage = this._config.baseDamage + (this._level - 1) * this._config.damagePerLevel;
    this._defense = GAME_CONFIG.combat.playerBaseDefense + (this._level - 1) * GAME_CONFIG.combat.defensePerLevel;
    
    // Heal to full
    this._health = this._maxHealth;
    
    console.log(`[BaseCharacter] LEVEL UP! Now level ${this._level}`);
    console.log(`[BaseCharacter] New stats - HP: ${this._maxHealth}, Damage: ${this._damage}, Defense: ${this._defense}`);
    
    // Emit level up event
    sceneEvents.emit(EVENTS.PLAYER_LEVEL_UP, this._level, this._maxHealth, this._damage);
    sceneEvents.emit(EVENTS.PLAYER_HEALTH_CHANGED, this._health, this._maxHealth);
  }

  protected getXpForNextLevel(): number {
    return this._config.xpForLevel(this._level + 1);
  }

  protected consumeEnergy(amount: number): void {
    this._energy = Math.max(0, this._energy - amount);
    this._lastEnergyUseTime = this.scene.time.now;
    sceneEvents.emit(EVENTS.PLAYER_ENERGY_CHANGED, this._energy, this._maxEnergy);
  }

  protected handleEnergyRegeneration(time: number, delta: number): void {
    // Only regenerate if we haven't used energy recently
    const timeSinceLastUse = time - this._lastEnergyUseTime;
    
    if (timeSinceLastUse >= this._config.energyRegenDelay && this._energy < this._maxEnergy) {
      // Regenerate energy based on time delta
      const regenAmount = (this._config.energyRegenRate * delta) / 1000;
      this._energy = Math.min(this._maxEnergy, this._energy + regenAmount);
      sceneEvents.emit(EVENTS.PLAYER_ENERGY_CHANGED, this._energy, this._maxEnergy);
    }
  }

  /**
   * Get combat stats for damage calculations
   */
  public getCombatStats(): CombatStats {
    return {
      damage: this._damage,
      defense: this._defense,
      level: this._level,
      critChance: GAME_CONFIG.combat.criticalChance
    };
  }
}

