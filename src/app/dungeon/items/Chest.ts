import Phaser from 'phaser';
import {GAME_CONFIG} from '../constants';

/**
 * Chest - Interactive treasure chest that can be opened by the player
 */
export class Chest extends Phaser.Physics.Arcade.Sprite {
  private opened = false;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
    super(scene, x, y, texture, frame);

    this.play('chest-closed');
  }

  /**
   * Opens the chest and returns the coins value
   * @returns The number of coins obtained, or 0 if already opened
   */
  open(): number {
    if (this.opened) {
      return 0;
    }

    this.opened = true;
    this.play('chest-open');

    return GAME_CONFIG.chest.coinsValue;
  }

  /**
   * Checks if the chest has been opened
   */
  isOpened(): boolean {
    return this.opened;
  }
}

