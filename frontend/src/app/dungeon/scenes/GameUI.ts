import Phaser from 'phaser';
import {sceneEvents, EVENTS} from '../events/EventsCenter';
import {SCENE_KEYS, GAME_CONFIG} from '../constants';

/**
 * GameUI Scene - Displays game UI elements like health and coins
 * Runs in parallel with the main Game scene
 */
export class GameUI extends Phaser.Scene {
  private hpBarBackground!: Phaser.GameObjects.Graphics;
  private hpBarFill!: Phaser.GameObjects.Graphics;
  private hpText!: Phaser.GameObjects.Text;
  private levelSquareBackground!: Phaser.GameObjects.Graphics;
  private levelSquareFill!: Phaser.GameObjects.Graphics;
  private levelText!: Phaser.GameObjects.Text;
  private energyBarBackground!: Phaser.GameObjects.Graphics;
  private energyBarFill!: Phaser.GameObjects.Graphics;
  private energyText!: Phaser.GameObjects.Text;
  private knifeCountText!: Phaser.GameObjects.Text;
  private coinsText!: Phaser.GameObjects.Text;
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

    // Get camera dimensions for positioning
    const camera = this.cameras.main;
    const width = camera.width;
    const height = camera.height;

    // === LEVEL SQUARE (Left Side) ===
    // Create black square background
    this.levelSquareBackground = this.add.graphics();
    this.levelSquareBackground.fillStyle(0x000000, 0.7);
    this.levelSquareBackground.fillRect(5, 5, 30, 30);
    this.levelSquareBackground.lineStyle(2, 0x000000, 0.8);
    this.levelSquareBackground.strokeRect(5, 5, 30, 30);

    // Create yellow fill for XP progress
    this.levelSquareFill = this.add.graphics();

    // Create level number text (centered in square)
    this.levelText = this.add.text(20, 20, '1', {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5).setAlpha(0.9);

    // Listen for XP changes
    sceneEvents.on(EVENTS.PLAYER_XP_CHANGED, this.handleXpChanged, this);

    // Listen for level up
    sceneEvents.on(EVENTS.PLAYER_LEVEL_UP, this.handleLevelUp, this);

    // Initialize with starting values
    this.updateLevelSquare(1, 0, GAME_CONFIG.player.xpForLevel(2));

    // === HP BAR (Right of square) ===
    // Create HP bar background
    this.hpBarBackground = this.add.graphics();
    this.hpBarBackground.fillStyle(0x000000, 0.6);
    this.hpBarBackground.fillRect(40, 5, 120, 14);
    
    // Add border to HP bar
    this.hpBarBackground.lineStyle(1, 0x000000, 0.8);
    this.hpBarBackground.strokeRect(40, 5, 120, 14);

    // Create HP bar fill
    this.hpBarFill = this.add.graphics();

    // Create HP text (centered on bar)
    this.hpText = this.add.text(100, 12, '3 / 3', {
      fontSize: '11px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0.5).setAlpha(0.9);

    // Listen for health changes
    sceneEvents.on(EVENTS.PLAYER_HEALTH_CHANGED, this.handleHealthChanged, this);

    // Initialize HP bar with starting health
    const startingHealth = GAME_CONFIG.player.baseMaxHealth;
    this.updateHpBar(startingHealth, startingHealth);

    // === ENERGY BAR (Below HP bar) ===
    this.energyBarBackground = this.add.graphics();
    this.energyBarBackground.fillStyle(0x000000, 0.6);
    this.energyBarBackground.fillRect(40, 21, 120, 14);
    
    // Add border to Energy bar
    this.energyBarBackground.lineStyle(1, 0x000000, 0.8);
    this.energyBarBackground.strokeRect(40, 21, 120, 14);

    // Create Energy bar fill
    this.energyBarFill = this.add.graphics();

    // Create Energy text
    this.energyText = this.add.text(100, 28, '100 / 100', {
      fontSize: '10px',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5).setAlpha(0.9);

    // Listen for energy changes
    sceneEvents.on(EVENTS.PLAYER_ENERGY_CHANGED, this.handleEnergyChanged, this);

    // Initialize energy bar with full energy
    this.updateEnergyBar(GAME_CONFIG.player.maxEnergy, GAME_CONFIG.player.maxEnergy);

    // === KNIFE COUNT (Below bars) ===
    const knifeIcon = this.add.image(40, 38, 'knife').setOrigin(0, 0).setScale(1).setAlpha(0.85);
    this.knifeCountText = this.add.text(48, 50, '5', {
      fontSize: '9px',
      color: '#ffffff'
    }).setOrigin(0.5, 0).setAlpha(0.9);

    // Listen for knife count changes
    sceneEvents.on(EVENTS.PLAYER_KNIFE_COUNT_CHANGED, (count: number) => {
      this.knifeCountText.text = count.toString();
    });

    // === COINS DISPLAY (Bottom right corner) ===
    const coinIcon = this.add.image(width - 25, height - 5, 'treasure', 0).setOrigin(1, 1).setScale(1).setAlpha(0.85);
    this.coinsText = this.add.text(width - 5, height - 5, '0', {
      fontSize: '11px',
      color: '#ffffff'
    }).setOrigin(1, 1).setAlpha(0.9);

    // Listen for coin changes
    sceneEvents.on(EVENTS.PLAYER_COINS_CHANGED, (coins: number) => {
      this.coinsText.text = coins.toString();
    });

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

  // === UPDATED: Replace heart-based system with HP bar ===
  private handleHealthChanged(health: number, maxHealth?: number): void {
    // If maxHealth is not provided, try to get it from the stored value or use default
    const currentMaxHealth = maxHealth || this._currentMaxHealth;
    this.updateHpBar(health, currentMaxHealth);
  }

  private updateHpBar(currentHp: number, maxHp: number): void {
    // Clear previous fill
    this.hpBarFill.clear();

    // Calculate fill percentage
    const percentage = Math.max(0, Math.min(currentHp / maxHp, 1));
    const barWidth = 120;
    const fillWidth = barWidth * percentage;

    // Always use red color for HP
    const color = 0xff0000;

    // Draw new fill with gradient effect
    this.hpBarFill.fillStyle(color, 0.8);
    this.hpBarFill.fillRect(40, 5, fillWidth, 14);
    
    // Add shine effect (lighter color on top half)
    this.hpBarFill.fillStyle(color, 0.3);
    this.hpBarFill.fillRect(40, 5, fillWidth, 7);

    // Update text
    this.hpText.setText(`${Math.floor(currentHp)} / ${maxHp}`);
    
    // Pulse effect when taking damage
    if (percentage < 0.3) {
      this.tweens.add({
        targets: this.hpBarFill,
        alpha: { from: 1, to: 0.7 },
        duration: 300,
        yoyo: true,
        repeat: 0
      });
    }
  }

  // Helper to store current values
  private _currentMaxHealth: number = GAME_CONFIG.player.baseMaxHealth;
  private _currentLevel: number = 1;
  
  private getCurrentMaxHealth(): number {
    return this._currentMaxHealth;
  }

  private handleXpChanged(currentXp: number, xpNeeded: number): void {
    const level = this._currentLevel || 1;
    this.updateLevelSquare(level, currentXp, xpNeeded);
  }

  private handleLevelUp(newLevel: number, maxHealth: number, damage: number): void {
    // Store current level
    this._currentLevel = newLevel;
    
    // Update level text
    this.levelText.setText(`${newLevel}`);

    // Show a level up effect on the square
    this.tweens.add({
      targets: [this.levelSquareBackground, this.levelSquareFill, this.levelText],
      scale: { from: 1, to: 1.2 },
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

    // Update stored max health and refresh HP bar
    this._currentMaxHealth = maxHealth;
    // Health will be updated via PLAYER_HEALTH_CHANGED event
    
    // Update level square with new level
    this.updateLevelSquare(newLevel, 0, GAME_CONFIG.player.xpForLevel(newLevel + 1));
  }

  private updateLevelSquare(level: number, currentXp: number, xpNeeded: number): void {
    // Clear previous fill
    this.levelSquareFill.clear();

    // Calculate fill percentage (bottom to top)
    const percentage = Math.min(currentXp / xpNeeded, 1);
    const squareSize = 30;
    const fillHeight = squareSize * percentage;

    // Draw yellow fill from bottom to top with transparency
    this.levelSquareFill.fillStyle(0xffff00, 0.5);
    this.levelSquareFill.fillRect(5, 5 + (squareSize - fillHeight), squareSize, fillHeight);

    // Update level text
    this.levelText.setText(`${level}`);
  }


  private handleEnergyChanged(currentEnergy: number, maxEnergy: number): void {
    this.updateEnergyBar(currentEnergy, maxEnergy);
  }

  private updateEnergyBar(currentEnergy: number, maxEnergy: number): void {
    // Clear previous fill
    this.energyBarFill.clear();

    // Calculate fill percentage
    const percentage = Math.min(currentEnergy / maxEnergy, 1);
    const barWidth = 120;
    const fillWidth = barWidth * percentage;

    // Draw new fill with green color and transparency
    this.energyBarFill.fillStyle(0x00ff00, 0.7);
    this.energyBarFill.fillRect(40, 21, fillWidth, 14);

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

