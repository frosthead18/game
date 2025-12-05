import Phaser from 'phaser';
import {GAME_CONFIG} from '../constants';

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
   * Opens the chest and returns the coins value
   * @returns The number of coins obtained, or 0 if already opened
   */
  open(): number {
    if (this.opened) {
      console.log('[Chest] Already opened, returning 0 coins');
      return 0;
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

    return GAME_CONFIG.chest.coinsValue;
  }

  /**
   * Checks if the chest has been opened
   */
  isOpened(): boolean {
    return this.opened;
  }
}

