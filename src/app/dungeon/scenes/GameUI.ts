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
  private energyBarBackground!: Phaser.GameObjects.Graphics;
  private energyBarFill!: Phaser.GameObjects.Graphics;
  private energyText!: Phaser.GameObjects.Text;
  private knifeCountText!: Phaser.GameObjects.Text;
  private deathOverlay?: Phaser.GameObjects.Container;
  private enterKey?: Phaser.Input.Keyboard.Key;

  constructor() {
    super({key: SCENE_KEYS.gameUI});
  }

  create(): void {
    // Set up Enter key
    if (this.input.keyboard) {
      this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    }

    // Coins display
    this.add.image(10, 10, 'treasure', 0).setOrigin(0, 0).setScale(1.5);

    const coinsLabel = this.add.text(30, 10, '0', {
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0, 0);

    // Listen for coin changes
    sceneEvents.on(EVENTS.PLAYER_COINS_CHANGED, (coins: number) => {
      coinsLabel.text = coins.toString();
    });

    // Knife count display
    const knifeIcon = this.add.image(70, 10, 'knife').setOrigin(0, 0).setScale(1.5);
    this.knifeCountText = this.add.text(95, 10, '5', {
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0, 0);

    // Listen for knife count changes
    sceneEvents.on(EVENTS.PLAYER_KNIFE_COUNT_CHANGED, (count: number) => {
      this.knifeCountText.text = count.toString();
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

    // Create Energy bar
    this.energyBarBackground = this.add.graphics();
    this.energyBarBackground.fillStyle(0x000000, 0.5);
    this.energyBarBackground.fillRect(10, 120, 150, 16);

    // Create Energy bar fill
    this.energyBarFill = this.add.graphics();

    // Create Energy text
    this.energyText = this.add.text(85, 120, '100 / 100', {
      fontSize: '12px',
      color: '#ffffff'
    }).setOrigin(0.5, 0);

    // Listen for energy changes
    sceneEvents.on(EVENTS.PLAYER_ENERGY_CHANGED, this.handleEnergyChanged, this);

    // Initialize energy bar with full energy
    this.updateEnergyBar(GAME_CONFIG.player.maxEnergy, GAME_CONFIG.player.maxEnergy);

    // Listen for player death
    sceneEvents.on(EVENTS.PLAYER_DIED, this.handlePlayerDeath, this);

    // Clean up event listeners when scene shuts down
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      sceneEvents.off(EVENTS.PLAYER_HEALTH_CHANGED, this.handleHealthChanged, this);
      sceneEvents.off(EVENTS.PLAYER_COINS_CHANGED);
      sceneEvents.off(EVENTS.PLAYER_XP_CHANGED, this.handleXpChanged, this);
      sceneEvents.off(EVENTS.PLAYER_LEVEL_UP, this.handleLevelUp, this);
      sceneEvents.off(EVENTS.PLAYER_KNIFE_COUNT_CHANGED);
      sceneEvents.off(EVENTS.PLAYER_ENERGY_CHANGED, this.handleEnergyChanged, this);
      sceneEvents.off(EVENTS.PLAYER_DIED, this.handlePlayerDeath, this);
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

  private handleEnergyChanged(currentEnergy: number, maxEnergy: number): void {
    this.updateEnergyBar(currentEnergy, maxEnergy);
  }

  private updateEnergyBar(currentEnergy: number, maxEnergy: number): void {
    // Clear previous fill
    this.energyBarFill.clear();

    // Calculate fill percentage
    const percentage = Math.min(currentEnergy / maxEnergy, 1);
    const barWidth = 150;
    const fillWidth = barWidth * percentage;

    // Draw new fill with cyan/blue color
    this.energyBarFill.fillStyle(0x00bfff, 0.8);
    this.energyBarFill.fillRect(10, 120, fillWidth, 16);

    // Update text
    this.energyText.setText(`${Math.floor(currentEnergy)} / ${maxEnergy}`);
  }

  private handlePlayerDeath(): void {
    this.createDeathOverlay();
  }

  private createDeathOverlay(): void {
    // Get camera dimensions
    const camera = this.cameras.main;
    const width = camera.width;
    const height = camera.height;

    // Create container for death overlay
    this.deathOverlay = this.add.container(0, 0);

    // Gray overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    this.deathOverlay.add(overlay);

    // "YOU DIED" text in red
    const deathText = this.add.text(width / 2, height / 2 - 30, 'YOU DIED', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.deathOverlay.add(deathText);

    // "Press ENTER to restart" text in white
    const restartText = this.add.text(width / 2, height / 2 + 40, 'Press ENTER to restart', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.deathOverlay.add(restartText);

    // Set depth to appear above everything
    this.deathOverlay.setDepth(1000);
  }

  override update(): void {
    // Check for Enter key press when death overlay is visible
    if (this.deathOverlay && this.enterKey && Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      this.restartGame();
    }
  }

  private restartGame(): void {
    // Remove death overlay
    if (this.deathOverlay) {
      this.deathOverlay.destroy();
      this.deathOverlay = undefined;
    }

    // Restart both scenes
    this.scene.stop(SCENE_KEYS.gameUI);
    this.scene.stop(SCENE_KEYS.game);
    this.scene.start(SCENE_KEYS.game);
  }
}

