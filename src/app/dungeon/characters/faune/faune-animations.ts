export enum FauneMovement {
  idleDown = 'faune-idle-down',
  idleUp = 'faune-idle-up',
  idleSide = 'faune-idle-side',
  runDown = 'faune-run-down',
  runUp = 'faune-run-up',
  runSide = 'faune-run-side',
}

export const createFauneAnimations = (anims: Phaser.Animations.AnimationManager) => {
  anims.create({
    key: FauneMovement.idleDown,
    frames: [{key: 'faune', frame: 'walk-down-3.png'}]
  });

  anims.create({
    key: FauneMovement.idleUp,
    frames: [{key: 'faune', frame: 'walk-up-3.png'}]
  });

  anims.create({
    key: FauneMovement.idleSide,
    frames: [{key: 'faune', frame: 'walk-side-3.png'}]
  });

  anims.create({
    key: FauneMovement.runDown,
    frames: anims.generateFrameNames('faune', {start: 1, end: 8, prefix: 'run-down-', suffix: '.png'}),
    repeat: -1,
    frameRate: 15
  });

  anims.create({
    key: FauneMovement.runUp,
    frames: anims.generateFrameNames('faune', {start: 1, end: 8, prefix: 'run-up-', suffix: '.png'}),
    repeat: -1,
    frameRate: 15
  });

  anims.create({
    key: FauneMovement.runSide,
    frames: anims.generateFrameNames('faune', {start: 1, end: 8, prefix: 'run-side-', suffix: '.png'}),
    repeat: -1,
    frameRate: 15
  });
}
