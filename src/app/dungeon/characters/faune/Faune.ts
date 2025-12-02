import {FauneMovement} from "./faune-animations";

export class Faune extends Phaser.Physics.Arcade.Sprite {
  constructor(screen: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
    super(screen, x, y, texture, frame);

    this.anims.play(FauneMovement.idleDown);
  }

  override preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
  }
}

