import {ANIMATION_CONFIG, ASSET_KEYS} from "../../constants";

export enum LizardMovement {
  idle = 'lizard-idle',
  run = 'lizard-run',
}

export const createLizardAnimations = (anims: Phaser.Animations.AnimationManager): void => {
  anims.create({
    key: LizardMovement.idle,
    frames: anims.generateFrameNames(ASSET_KEYS.lizard, {
      start: ANIMATION_CONFIG.lizard.frameStart,
      end: ANIMATION_CONFIG.lizard.frameEnd,
      prefix: 'lizard_m_idle_anim_f',
      suffix: '.png'
    }),
    repeat: ANIMATION_CONFIG.repeatInfinite,
    frameRate: ANIMATION_CONFIG.lizard.frameRate
  });

  anims.create({
    key: LizardMovement.run,
    frames: anims.generateFrameNames(ASSET_KEYS.lizard, {
      start: ANIMATION_CONFIG.lizard.frameStart,
      end: ANIMATION_CONFIG.lizard.frameEnd,
      prefix: 'lizard_m_run_anim_f',
      suffix: '.png'
    }),
    repeat: ANIMATION_CONFIG.repeatInfinite,
    frameRate: ANIMATION_CONFIG.lizard.frameRate
  });
};
