import Phaser from 'phaser';
import {sceneEvents, EVENTS} from '../events/EventsCenter';
import {SCENE_KEYS, GAME_CONFIG} from '../constants';

/**
 * GameUI Scene - Displays game UI elements like health hearts and coins
 * Runs in parallel with the main Game scene
 */
export class GameUI extends Phaser.Scene {
  private hearts!: Phaser.GameObjects.Group;

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

    // Clean up event listeners when scene shuts down
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      sceneEvents.off(EVENTS.PLAYER_HEALTH_CHANGED, this.handleHealthChanged, this);
      sceneEvents.off(EVENTS.PLAYER_COINS_CHANGED);
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
}

