import {CharacterType, CHARACTER_CONFIGS, ANIMATION_CONFIG} from "../constants";

/**
 * Creates animations for a specific character type based on its configuration
 */
export const createCharacterAnimations = (
  anims: Phaser.Animations.AnimationManager,
  characterType: CharacterType
): void => {
  const config = CHARACTER_CONFIGS[characterType];
  
  // Idle animations (single frame)
  anims.create({
    key: `${characterType}_idle_down`,
    frames: [{key: characterType, frame: config.idleDownFrame}]
  });

  anims.create({
    key: `${characterType}_idle_up`,
    frames: [{key: characterType, frame: config.idleUpFrame}]
  });

  anims.create({
    key: `${characterType}_idle_side`,
    frames: [{key: characterType, frame: config.idleSideFrame}]
  });

  // Run animations
  anims.create({
    key: `${characterType}_run_down`,
    frames: anims.generateFrameNames(characterType, {
      start: config.runFrameStart,
      end: config.runFrameEnd,
      prefix: 'run-down-',
      suffix: '.png'
    }),
    repeat: ANIMATION_CONFIG.repeatInfinite,
    frameRate: config.frameRate
  });

  anims.create({
    key: `${characterType}_run_up`,
    frames: anims.generateFrameNames(characterType, {
      start: config.runFrameStart,
      end: config.runFrameEnd,
      prefix: 'run-up-',
      suffix: '.png'
    }),
    repeat: ANIMATION_CONFIG.repeatInfinite,
    frameRate: config.frameRate
  });

  anims.create({
    key: `${characterType}_run_side`,
    frames: anims.generateFrameNames(characterType, {
      start: config.runFrameStart,
      end: config.runFrameEnd,
      prefix: 'run-side-',
      suffix: '.png'
    }),
    repeat: ANIMATION_CONFIG.repeatInfinite,
    frameRate: config.frameRate
  });

  // Faint/death animation
  anims.create({
    key: `${characterType}_faint_down`,
    frames: anims.generateFrameNames(characterType, {
      start: 1,
      end: 4,
      prefix: 'faint-',
      suffix: '.png'
    }),
    frameRate: 10
  });
};

/**
 * Creates all character animations for preloading
 */
export const createAllCharacterAnimations = (anims: Phaser.Animations.AnimationManager): void => {
  Object.values(CharacterType).forEach(characterType => {
    createCharacterAnimations(anims, characterType);
  });
};

