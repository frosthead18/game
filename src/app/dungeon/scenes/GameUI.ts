import Phaser from 'phaser';
import {sceneEvents, EVENTS} from '../events/EventsCenter';
import {SCENE_KEYS, GAME_CONFIG} from '../constants';

/**
 * GameUI Scene - Displays game UI elements like health hearts and coins
 * Runs in parallel with the main Game scene
 */
export class GameUI extends Phaser.Scene {
  private hearts!: Phaser.GameObjects.Group;
  private levelText!: Phaser.GameObjects.Text;
  private xpBarBackground!: Phaser.GameObjects.Graphics;
  private xpBarFill!: Phaser.GameObjects.Graphics;
  private xpText!: Phaser.GameObjects.Text;

  constructor() {
    super({key: SCENE_KEYS.gameUI});
  }

  create(): void {
    this.add.image(10, 10, 'treasure', 0).setOrigin(0, 0).setScale(1.5);

    const coinsLabel = this.add.text(30, 10, '0', {
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0, 0);

    // Listen for coin changes
    sceneEvents.on(EVENTS.PLAYER_COINS_CHANGED, (coins: number) => {
      coinsLabel.text = coins.toString();
    });

    // Create hearts for health display
    this.hearts = this.add.group({
      classType: Phaser.GameObjects.Image
    });

    this.hearts.createMultiple({
      key: 'ui-heart-full',
      setXY: {
        x: 10,
        y: 40,
        stepX: 20
      },
      quantity: GAME_CONFIG.player.maxHealth
    });

    // Listen for health changes
    sceneEvents.on(EVENTS.PLAYER_HEALTH_CHANGED, this.handleHealthChanged, this);

    // Create level display
    this.levelText = this.add.text(10, 70, 'Level 1', {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0, 0);

    // Create XP bar background
    this.xpBarBackground = this.add.graphics();
    this.xpBarBackground.fillStyle(0x000000, 0.5);
    this.xpBarBackground.fillRect(10, 95, 150, 16);

    // Create XP bar fill
    this.xpBarFill = this.add.graphics();

    // Create XP text
    this.xpText = this.add.text(85, 95, '0 / 100', {
      fontSize: '12px',
      color: '#ffffff'
    }).setOrigin(0.5, 0);

    // Listen for XP changes
    sceneEvents.on(EVENTS.PLAYER_XP_CHANGED, this.handleXpChanged, this);

    // Listen for level up
    sceneEvents.on(EVENTS.PLAYER_LEVEL_UP, this.handleLevelUp, this);

    // Initialize with starting values
    this.updateXpBar(0, GAME_CONFIG.player.xpForLevel(2));

    // Clean up event listeners when scene shuts down
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      sceneEvents.off(EVENTS.PLAYER_HEALTH_CHANGED, this.handleHealthChanged, this);
      sceneEvents.off(EVENTS.PLAYER_COINS_CHANGED);
      sceneEvents.off(EVENTS.PLAYER_XP_CHANGED, this.handleXpChanged, this);
      sceneEvents.off(EVENTS.PLAYER_LEVEL_UP, this.handleLevelUp, this);
    });
  }

  private handleHealthChanged(health: number): void {
    const hearts = this.hearts.getChildren() as Phaser.GameObjects.Image[];

    for (let i = 0; i < hearts.length; i++) {
      const heart = hearts[i];
      if (i < health) {
        heart.setTexture('ui-heart-full');
      } else {
        heart.setTexture('ui-heart-empty');
      }
    }
  }

  private handleXpChanged(currentXp: number, xpNeeded: number): void {
    this.updateXpBar(currentXp, xpNeeded);
  }

  private handleLevelUp(newLevel: number, maxHealth: number, damage: number): void {
    // Update level text
    this.levelText.setText(`Level ${newLevel}`);

    // Show a level up effect
    this.tweens.add({
      targets: this.levelText,
      scale: { from: 1, to: 1.3 },
      duration: 200,
      yoyo: true,
      ease: 'Power2'
    });

    // Flash the level text
    this.tweens.add({
      targets: this.levelText,
      alpha: { from: 1, to: 0.5 },
      duration: 100,
      yoyo: true,
      repeat: 3
    });

    // Update hearts for new max health
    this.updateMaxHealth(maxHealth);
  }

  private updateXpBar(currentXp: number, xpNeeded: number): void {
    // Clear previous fill
    this.xpBarFill.clear();

    // Calculate fill percentage
    const percentage = Math.min(currentXp / xpNeeded, 1);
    const barWidth = 150;
    const fillWidth = barWidth * percentage;

    // Draw new fill
    this.xpBarFill.fillStyle(0x00ff00, 0.8);
    this.xpBarFill.fillRect(10, 95, fillWidth, 16);

    // Update text
    this.xpText.setText(`${currentXp} / ${xpNeeded}`);
  }

  private updateMaxHealth(maxHealth: number): void {
    // Clear existing hearts
    this.hearts.clear(true, true);

    // Create new hearts based on new max health
    this.hearts.createMultiple({
      key: 'ui-heart-full',
      setXY: {
        x: 10,
        y: 40,
        stepX: 20
      },
      quantity: maxHealth
    });
  }
}

