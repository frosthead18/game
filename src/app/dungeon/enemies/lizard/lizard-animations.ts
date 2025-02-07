export enum LizardMovement {
  idle = 'lizard-idle',
  run = 'lizard-run',
}

export const createLizardAnimations = (anims: Phaser.Animations.AnimationManager) => {
  anims.create({
    key: LizardMovement.idle,
    frames: anims.generateFrameNames('lizard', {start: 0, end: 3, prefix: 'lizard_m_idle_anim_f', suffix: '.png'}),
    repeat: -1,
    frameRate: 10
  });

  anims.create({
    key: LizardMovement.run,
    frames: anims.generateFrameNames('lizard', {start: 0, end: 3, prefix: 'lizard_m_run_anim_f', suffix: '.png'}),
    repeat: -1,
    frameRate: 10
  });
}
