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
    frames: [{key: ASSET_KEYS.treasure, frame: 0}],
    frameRate: ANIMATION_CONFIG.faune.frameRate
  });

  // Opening chest animation
  anims.create({
    key: ChestAnimation.open,
    frames: anims.generateFrameNumbers(ASSET_KEYS.treasure, {start: 0, end: 2}),
    frameRate: ANIMATION_CONFIG.faune.frameRate
  });
}

