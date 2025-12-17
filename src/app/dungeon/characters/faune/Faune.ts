import {BaseCharacter, HealthState} from "../BaseCharacter";
import {CharacterType} from "../../constants";

declare global {
  namespace Phaser.GameObjects {
    interface GameObjectFactory {
      faune(x: number, y: number, texture: string, frame?: string | number): Faune;
    }
  }
}

export class Faune extends BaseCharacter {
  constructor(scene: Phaser.Scene, x: number, y: number, characterType: CharacterType, level?: number) {
    super(scene, x, y, characterType, level);
  }
  
  // All core functionality is now inherited from BaseCharacter
  // This class can be extended with Faune-specific abilities in the future
}
