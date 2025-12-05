import Phaser from 'phaser';
import {ANIMATION_CONFIG, ASSET_KEYS} from '../constants';

/**
 * Chest animation keys
 */
export enum ChestAnimation {
  closed = 'chest-closed',
  open = 'chest-open'
}

/**
 * Creates all chest/treasure animations
 */
export function createChestAnimations(anims: Phaser.Animations.AnimationManager): void {
  // Closed chest (idle state)
  anims.create({
    key: ChestAnimation.closed,
    frames: [{key: ASSET_KEYS.treasure, frame: 'chest_empty_open_anim_f0.png'}],
    frameRate: ANIMATION_CONFIG.faune.frameRate
  });

  // Opening chest animation
  anims.create({
    key: ChestAnimation.open,
    frames: anims.generateFrameNames(ASSET_KEYS.treasure, {
      prefix: 'chest_empty_open_anim_f',
      suffix: '.png',
      start: 0,
      end: 2
    }),
    frameRate: ANIMATION_CONFIG.faune.frameRate
  });
}

