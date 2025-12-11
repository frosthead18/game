import {EnemyType, ANIMATION_CONFIG, ENEMY_CONFIGS} from "../constants";

/**
 * Creates animations for a specific enemy type based on its configuration
 */
export const createEnemyAnimations = (anims: Phaser.Animations.AnimationManager, enemyType: EnemyType): void => {
  const config = ENEMY_CONFIGS[enemyType];
  const animConfig = ANIMATION_CONFIG.enemy;

  switch (config.animationType) {
    case 'standard':
      // Standard enemies have idle and run animations
      createStandardAnimations(anims, enemyType, config.idleFramePrefix!, config.runFramePrefix!, animConfig);
      break;

    case 'advanced':
      // Advanced enemies have hit, idle, and run animations
      createAdvancedAnimations(
        anims,
        enemyType,
        config.hitFramePrefix!,
        config.idleFramePrefix!,
        config.runFramePrefix!,
        animConfig
      );
      break;

    case 'simple':
      // Simple enemies have a single animation
      createSimpleAnimation(anims, enemyType, config.animFramePrefix!, animConfig);
      break;
  }
};

/**
 * Creates all enemy animations for preloading
 */
export const createAllEnemyAnimations = (anims: Phaser.Animations.AnimationManager): void => {
  Object.values(EnemyType).forEach(enemyType => {
    createEnemyAnimations(anims, enemyType);
  });
};

/**
 * Standard animation pattern: idle + run
 */
function createStandardAnimations(
  anims: Phaser.Animations.AnimationManager,
  enemyType: EnemyType,
  idlePrefix: string,
  runPrefix: string,
  animConfig: typeof ANIMATION_CONFIG.enemy
): void {
  // Idle animation
  const idleFrames = anims.generateFrameNames(enemyType, {
    start: animConfig.frameStart,
    end: animConfig.frameEnd,
    prefix: idlePrefix,
    suffix: '.png'
  });
  
  anims.create({
    key: `${enemyType}_idle`,
    frames: idleFrames,
    repeat: ANIMATION_CONFIG.repeatInfinite,
    frameRate: animConfig.frameRate
  });

  // Run animation
  const runFrames = anims.generateFrameNames(enemyType, {
    start: animConfig.frameStart,
    end: animConfig.frameEnd,
    prefix: runPrefix,
    suffix: '.png'
  });
  
  anims.create({
    key: `${enemyType}_run`,
    frames: runFrames,
    repeat: ANIMATION_CONFIG.repeatInfinite,
    frameRate: animConfig.frameRate
  });
}

/**
 * Advanced animation pattern: hit + idle + run
 */
function createAdvancedAnimations(
  anims: Phaser.Animations.AnimationManager,
  enemyType: EnemyType,
  hitPrefix: string,
  idlePrefix: string,
  runPrefix: string,
  animConfig: typeof ANIMATION_CONFIG.enemy
): void {
  // Hit animation (single frame)
  anims.create({
    key: `${enemyType}_hit`,
    frames: anims.generateFrameNames(enemyType, {
      start: 0,
      end: 0,
      prefix: hitPrefix,
      suffix: '.png'
    }),
    repeat: 0,
    frameRate: animConfig.frameRate
  });

  // Idle animation
  anims.create({
    key: `${enemyType}_idle`,
    frames: anims.generateFrameNames(enemyType, {
      start: animConfig.frameStart,
      end: animConfig.frameEnd,
      prefix: idlePrefix,
      suffix: '.png'
    }),
    repeat: ANIMATION_CONFIG.repeatInfinite,
    frameRate: animConfig.frameRate
  });

  // Run animation
  anims.create({
    key: `${enemyType}_run`,
    frames: anims.generateFrameNames(enemyType, {
      start: animConfig.frameStart,
      end: animConfig.frameEnd,
      prefix: runPrefix,
      suffix: '.png'
    }),
    repeat: ANIMATION_CONFIG.repeatInfinite,
    frameRate: animConfig.frameRate
  });
}

/**
 * Simple animation pattern: single animation only
 */
function createSimpleAnimation(
  anims: Phaser.Animations.AnimationManager,
  enemyType: EnemyType,
  animPrefix: string,
  animConfig: typeof ANIMATION_CONFIG.enemy
): void {
  const animFrames = anims.generateFrameNames(enemyType, {
    start: animConfig.frameStart,
    end: animConfig.frameEnd,
    prefix: animPrefix,
    suffix: '.png'
  });
  anims.create({
    key: `${enemyType}_anim`,
    frames: animFrames,
    repeat: ANIMATION_CONFIG.repeatInfinite,
    frameRate: animConfig.frameRate
  });
}

