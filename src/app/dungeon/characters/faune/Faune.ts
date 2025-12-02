import {FauneMovement} from "./faune-animations";
import {GAME_CONFIG} from "../../constants";

export class Faune extends Phaser.Physics.Arcade.Sprite {
  private lastDirection: FauneMovement = FauneMovement.idleDown;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
    super(scene, x, y, texture, frame);

    this.anims.play(FauneMovement.idleDown);
    this.configureBody();
  }

  setCursors(cursors: Phaser.Types.Input.Keyboard.CursorKeys): void {
    this.cursors = cursors;
  }

  override preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);

    if (!this.cursors) {
      return;
    }

    this.handleMovement();
  }

  private configureBody(): void {
    this.body?.setSize(
      this.width * GAME_CONFIG.player.bodyWidthRatio,
      this.height * GAME_CONFIG.player.bodyHeightRatio
    );
  }

  private handleMovement(): void {
    let moveX = 0;
    let moveY = 0;

    if (this.cursors!.left?.isDown) {
      moveX = -1;
      this.setFlipX(true);
      this.lastDirection = FauneMovement.runSide;
    } else if (this.cursors!.right?.isDown) {
      moveX = 1;
      this.setFlipX(false);
      this.lastDirection = FauneMovement.runSide;
    }

    if (this.cursors!.up?.isDown) {
      moveY = -1;
      this.lastDirection = FauneMovement.runUp;
    } else if (this.cursors!.down?.isDown) {
      moveY = 1;
      this.lastDirection = FauneMovement.runDown;
    }

    if (moveX !== 0 || moveY !== 0) {
      this.anims.play(this.lastDirection, true);
    } else {
      this.playIdleAnimation();
    }

    this.setVelocity(moveX * GAME_CONFIG.player.speed, moveY * GAME_CONFIG.player.speed);
  }

  private playIdleAnimation(): void {
    const idleAction = this.lastDirection.replace(/-run-/, '-idle-') as FauneMovement;
    this.anims.play(idleAction);
  }
}

