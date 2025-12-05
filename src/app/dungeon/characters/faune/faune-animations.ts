import {ANIMATION_CONFIG, ASSET_KEYS} from "../../constants";

export enum FauneMovement {
  idleDown = 'faune-idle-down',
  idleUp = 'faune-idle-up',
  idleSide = 'faune-idle-side',
  runDown = 'faune-run-down',
  runUp = 'faune-run-up',
  runSide = 'faune-run-side',
  faintDown = 'faune-faint-down'
}

export const createFauneAnimations = (anims: Phaser.Animations.AnimationManager): void => {
  // Idle animations
  anims.create({
    key: FauneMovement.idleDown,
    frames: [{key: ASSET_KEYS.faune, frame: 'walk-down-3.png'}]
  });

  anims.create({
    key: FauneMovement.idleUp,
    frames: [{key: ASSET_KEYS.faune, frame: 'walk-up-3.png'}]
  });

  anims.create({
    key: FauneMovement.idleSide,
    frames: [{key: ASSET_KEYS.faune, frame: 'walk-side-3.png'}]
  });

  // Run animations
  anims.create({
    key: FauneMovement.runDown,
    frames: anims.generateFrameNames(ASSET_KEYS.faune, {
      start: ANIMATION_CONFIG.faune.runFrameStart,
      end: ANIMATION_CONFIG.faune.runFrameEnd,
      prefix: 'run-down-',
      suffix: '.png'
    }),
    repeat: ANIMATION_CONFIG.repeatInfinite,
    frameRate: ANIMATION_CONFIG.faune.frameRate
  });

  anims.create({
    key: FauneMovement.runUp,
    frames: anims.generateFrameNames(ASSET_KEYS.faune, {
      start: ANIMATION_CONFIG.faune.runFrameStart,
      end: ANIMATION_CONFIG.faune.runFrameEnd,
      prefix: 'run-up-',
      suffix: '.png'
    }),
    repeat: ANIMATION_CONFIG.repeatInfinite,
    frameRate: ANIMATION_CONFIG.faune.frameRate
  });

  anims.create({
    key: FauneMovement.runSide,
    frames: anims.generateFrameNames(ASSET_KEYS.faune, {
      start: ANIMATION_CONFIG.faune.runFrameStart,
      end: ANIMATION_CONFIG.faune.runFrameEnd,
      prefix: 'run-side-',
      suffix: '.png'
    }),
    repeat: ANIMATION_CONFIG.repeatInfinite,
    frameRate: ANIMATION_CONFIG.faune.frameRate
  });

  // Faint/death animation
  anims.create({
    key: FauneMovement.faintDown,
    frames: [{key: ASSET_KEYS.faune, frame: 'faint.png'}]
  });
};
