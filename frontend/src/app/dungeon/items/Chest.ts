import Phaser from 'phaser';
import {GAME_CONFIG} from '../constants';

/**
 * Loot interface representing items dropped from a chest
 */
export interface ChestLoot {
  coins: number;
  knives: number;
}

/**
 * Chest - Interactive treasure chest that can be opened by the player
 */
export class Chest extends Phaser.Physics.Arcade.Sprite {
  private opened = false;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
    super(scene, x, y, texture, frame);

    // Set initial closed state
    if (this.anims && this.anims.exists('chest-closed')) {
      this.play('chest-closed');
    } else {
      // Fallback to first frame if animation doesn't exist
      this.setFrame('chest_empty_open_anim_f0.png');
    }
  }

  /**
   * Opens the chest and returns the loot
   * @returns ChestLoot object containing coins and knives, or null if already opened
   */
  open(): ChestLoot | null {
    if (this.opened) {
      console.log('[Chest] Already opened, returning null');
      return null;
    }

    console.log('[Chest] Opening chest, playing animation');
    this.opened = true;
    
    // Check if animation exists before playing
    if (this.anims && this.anims.exists('chest-open')) {
      this.play('chest-open');
    } else {
      console.warn('[Chest] Animation "chest-open" not found, skipping animation');
      // Still set the chest to open state frame if animation doesn't exist
      this.setFrame('chest_empty_open_anim_f2.png');
    }

    // Generate random loot
    const coins = Phaser.Math.Between(GAME_CONFIG.chest.minCoins, GAME_CONFIG.chest.maxCoins);
    const knives = Phaser.Math.Between(GAME_CONFIG.chest.minKnives, GAME_CONFIG.chest.maxKnives);

    console.log(`[Chest] Generated loot: ${coins} coins, ${knives} knives`);
    
    return { coins, knives };
  }

  /**
   * Checks if the chest has been opened
   */
  isOpened(): boolean {
    return this.opened;
  }
}

