import {FauneMovement} from "./faune-animations";
import {GAME_CONFIG} from "../../constants";
import {sceneEvents, EVENTS} from "../../events/EventsCenter";
import {Chest} from "../../items/Chest";

declare global {
  namespace Phaser.GameObjects {
    interface GameObjectFactory {
      faune(x: number, y: number, texture: string, frame?: string | number): Faune;
    }
  }
}

export enum HealthState {
  IDLE,
  DAMAGE,
  DEAD
}

export class Faune extends Phaser.Physics.Arcade.Sprite {
  private lastDirection: FauneMovement = FauneMovement.idleDown;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private healthState = HealthState.IDLE;
  private damageTime = 0;
  private _health: number;
  private _maxHealth: number;
  private _coins = 0;
  private _level: number;
  private _xp: number;
  private _damage: number;
  private knives?: Phaser.Physics.Arcade.Group;
  private activeChest?: Chest;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
    super(scene, x, y, texture, frame);
    
    // Initialize leveling stats
    this._level = GAME_CONFIG.player.level;
    this._xp = GAME_CONFIG.player.xp;
    this._maxHealth = GAME_CONFIG.player.baseMaxHealth;
    this._health = this._maxHealth;
    this._damage = GAME_CONFIG.player.baseDamage;
  }

  setCursors(cursors: Phaser.Types.Input.Keyboard.CursorKeys): void {
    this.cursors = cursors;
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

  override preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);

    if (!this.cursors) {
      return;
    }

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

  private getCurrentTime(): number {
    return this.scene.time.now;
  }

  private handleMovement(): void {
    if (!this.cursors) {
      return;
    }

    let moveX = 0;
    let moveY = 0;

    // Handle space bar for chest opening
    if (Phaser.Input.Keyboard.JustDown(this.cursors.space!)) {
      if (this.activeChest) {
        console.log('[Faune] Space pressed, attempting to open chest');
        const coins = this.activeChest.open();
        console.log(`[Faune] Chest opened, received ${coins} coins`);
        this._coins += coins;
        sceneEvents.emit(EVENTS.PLAYER_COINS_CHANGED, this._coins);
      } else {
        console.log('[Faune] Space pressed but no active chest');
      }
      return;
    }

    // Handle movement
    if (this.cursors.left?.isDown) {
      moveX = -1;
      this.setFlipX(true);
      this.lastDirection = FauneMovement.runSide;
    } else if (this.cursors.right?.isDown) {
      moveX = 1;
      this.setFlipX(false);
      this.lastDirection = FauneMovement.runSide;
    }

    if (this.cursors.up?.isDown) {
      moveY = -1;
      this.lastDirection = FauneMovement.runUp;
    } else if (this.cursors.down?.isDown) {
      moveY = 1;
      this.lastDirection = FauneMovement.runDown;
    }

    // Update animation
    if (moveX !== 0 || moveY !== 0) {
      this.anims.play(this.lastDirection, true);
    } else {
      this.playIdleAnimation();
    }

    this.setVelocity(moveX * GAME_CONFIG.player.speed, moveY * GAME_CONFIG.player.speed);

    // Handle knife throwing
    if (Phaser.Input.Keyboard.JustDown(this.cursors.shift!)) {
      this.throwKnife();
    }
  }

  private playIdleAnimation(): void {
    const idleAction = this.lastDirection.replace(/-run-/, '-idle-') as FauneMovement;
    this.anims.play(idleAction);
  }

  private handleDamageState(time: number): void {
    if (this.damageTime > time) {
      return;
    }

    console.log(`[Faune] Exiting DAMAGE state at ${time}, returning to IDLE`);
    this.healthState = HealthState.IDLE;
    this.setTint(0xffffff);
  }

  private throwKnife(): void {
    if (!this.knives) {
      return;
    }

    const knife = this.knives.get(this.x, this.y, 'knife') as Phaser.Physics.Arcade.Image;
    if (!knife) {
      return;
    }

    // Determine throw direction based on player's facing direction
    const parts = this.anims.currentAnim?.key.split('-');
    const direction = parts?.[2];

    const vec = new Phaser.Math.Vector2(0, 0);

    switch (direction) {
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
  }

  public handleDamage(dir: Phaser.Math.Vector2): void {
    if (this._health <= 0) {
      return;
    }

    if (this.healthState === HealthState.DAMAGE) {
      return;
    }

    this._health--;
    sceneEvents.emit(EVENTS.PLAYER_HEALTH_CHANGED, this._health);

    if (this._health <= 0) {
      console.log('[Faune] Player DEAD');
      this.healthState = HealthState.DEAD;
      this.anims.play(FauneMovement.faintDown);
      this.setVelocity(0, 0);
      sceneEvents.emit(EVENTS.PLAYER_DIED);
    } else {
      const currentTime = this.getCurrentTime();
      this.damageTime = currentTime + GAME_CONFIG.player.damageTimeDelay;
      this.healthState = HealthState.DAMAGE;

      console.log(`[Faune] Entering DAMAGE state at ${currentTime}, will exit at ${this.damageTime}`);
      
      this.setVelocity(dir.x, dir.y);
      this.setTint(0xff0000);
    }
  }

  public gainXp(amount: number): void {
    this._xp += amount;
    console.log(`[Faune] Gained ${amount} XP, total: ${this._xp}`);
    
    // Emit XP changed event
    sceneEvents.emit(EVENTS.PLAYER_XP_CHANGED, this._xp, this.getXpForNextLevel());
    
    // Check for level up
    while (this._xp >= this.getXpForNextLevel()) {
      this.levelUp();
    }
  }

  private levelUp(): void {
    // Deduct XP for level up
    this._xp -= this.getXpForNextLevel();
    this._level++;
    
    // Recalculate stats
    this._maxHealth = GAME_CONFIG.player.baseMaxHealth + 
                      (this._level - 1) * GAME_CONFIG.player.healthPerLevel;
    this._damage = GAME_CONFIG.player.baseDamage + 
                   (this._level - 1) * GAME_CONFIG.player.damagePerLevel;
    
    // Heal to full
    this._health = this._maxHealth;
    
    console.log(`[Faune] LEVEL UP! Now level ${this._level}`);
    console.log(`[Faune] New stats - HP: ${this._maxHealth}, Damage: ${this._damage}`);
    
    // Emit level up event
    sceneEvents.emit(EVENTS.PLAYER_LEVEL_UP, this._level, this._maxHealth, this._damage);
    sceneEvents.emit(EVENTS.PLAYER_HEALTH_CHANGED, this._health);
  }

  private getXpForNextLevel(): number {
    return GAME_CONFIG.player.xpForLevel(this._level + 1);
  }
}

Phaser.GameObjects.GameObjectFactory.register('faune', function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number, texture: string, frame?: string | number) {
  const faune = new Faune(this.scene, x, y, texture, frame);

  this.displayList.add(faune);
  this.updateList.add(faune);
  this.scene.physics.world.enable(faune, Phaser.Physics.Arcade.DYNAMIC_BODY);

  faune.body?.setSize(
    faune.width * GAME_CONFIG.player.bodyWidthRatio,
    faune.height * GAME_CONFIG.player.bodyHeightRatio
  );

  faune.anims.play(FauneMovement.idleDown);

  return faune;
});

