import {NPCType, ANIMATION_CONFIG, NPC_CONFIGS} from "../constants";

/**
 * Creates animations for a specific NPC type based on its configuration
 */
export const createNPCAnimations = (anims: Phaser.Animations.AnimationManager, npcType: NPCType): void => {
  const config = NPC_CONFIGS[npcType];
  const animConfig = ANIMATION_CONFIG.npc;

  // Use custom frame range if specified, otherwise use default
  const frameConfig = {
    frameStart: config.frameStart ?? animConfig.frameStart,
    frameEnd: config.frameEnd ?? animConfig.frameEnd,
    frameRate: animConfig.frameRate
  };

  switch (config.animationType) {
    case 'standard':
      // Standard enemies have idle and run animations
      createStandardAnimations(anims, npcType, config.idleFramePrefix!, config.runFramePrefix!, frameConfig);
      break;

    case 'advanced':
      // Advanced enemies have hit, idle, and run animations
      createAdvancedAnimations(
        anims,
        npcType,
        config.hitFramePrefix!,
        config.idleFramePrefix!,
        config.runFramePrefix!,
        frameConfig
      );
      break;

    case 'simple':
      // Simple enemies have a single animation
      createSimpleAnimation(anims, npcType, config.animFramePrefix!, frameConfig);
      break;
  }
};

/**
 * Creates all NPC animations for preloading
 */
export const createAllNPCAnimations = (anims: Phaser.Animations.AnimationManager): void => {
  Object.values(NPCType).forEach(npcType => {
    createNPCAnimations(anims, npcType);
  });
};

/**
 * Standard animation pattern: idle + run
 */
function createStandardAnimations(
  anims: Phaser.Animations.AnimationManager,
  npcType: NPCType,
  idlePrefix: string,
  runPrefix: string,
  frameConfig: { frameStart: number; frameEnd: number; frameRate: number }
): void {
  // Idle animation
  const idleFrames = anims.generateFrameNames(npcType, {
    start: frameConfig.frameStart,
    end: frameConfig.frameEnd,
    prefix: idlePrefix,
    suffix: '.png'
  });

  anims.create({
    key: `${npcType}_idle`,
    frames: idleFrames,
    repeat: ANIMATION_CONFIG.repeatInfinite,
    frameRate: frameConfig.frameRate
  });

  // Run animation
  const runFrames = anims.generateFrameNames(npcType, {
    start: frameConfig.frameStart,
    end: frameConfig.frameEnd,
    prefix: runPrefix,
    suffix: '.png'
  });

  anims.create({
    key: `${npcType}_run`,
    frames: runFrames,
    repeat: ANIMATION_CONFIG.repeatInfinite,
    frameRate: frameConfig.frameRate
  });
}

/**
 * Advanced animation pattern: hit + idle + run
 */
function createAdvancedAnimations(
  anims: Phaser.Animations.AnimationManager,
  npcType: NPCType,
  hitPrefix: string,
  idlePrefix: string,
  runPrefix: string,
  frameConfig: { frameStart: number; frameEnd: number; frameRate: number }
): void {
  // Hit animation (single frame)
  anims.create({
    key: `${npcType}_hit`,
    frames: anims.generateFrameNames(npcType, {
      start: 0,
      end: 0,
      prefix: hitPrefix,
      suffix: '.png'
    }),
    repeat: 0,
    frameRate: frameConfig.frameRate
  });

  // Idle animation
  anims.create({
    key: `${npcType}_idle`,
    frames: anims.generateFrameNames(npcType, {
      start: frameConfig.frameStart,
      end: frameConfig.frameEnd,
      prefix: idlePrefix,
      suffix: '.png'
    }),
    repeat: ANIMATION_CONFIG.repeatInfinite,
    frameRate: frameConfig.frameRate
  });

  // Run animation
  anims.create({
    key: `${npcType}_run`,
    frames: anims.generateFrameNames(npcType, {
      start: frameConfig.frameStart,
      end: frameConfig.frameEnd,
      prefix: runPrefix,
      suffix: '.png'
    }),
    repeat: ANIMATION_CONFIG.repeatInfinite,
    frameRate: frameConfig.frameRate
  });
}

/**
 * Simple animation pattern: single animation only
 */
function createSimpleAnimation(
  anims: Phaser.Animations.AnimationManager,
  npcType: NPCType,
  animPrefix: string,
  frameConfig: { frameStart: number; frameEnd: number; frameRate: number }
): void {
  const animFrames = anims.generateFrameNames(npcType, {
    start: frameConfig.frameStart,
    end: frameConfig.frameEnd,
    prefix: animPrefix,
    suffix: '.png'
  });
  anims.create({
    key: `${npcType}_anim`,
    frames: animFrames,
    repeat: ANIMATION_CONFIG.repeatInfinite,
    frameRate: frameConfig.frameRate
  });
}

