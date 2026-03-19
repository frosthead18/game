import {BaseCharacter} from "./BaseCharacter";
import {CharacterType, CHARACTER_CONFIGS} from "../constants";
import {Faune} from "./faune/Faune";

/**
 * Factory class for creating character instances
 */
export class CharacterFactory {
  /**
   * Creates a character of the specified type
   */
  static createCharacter(
    scene: Phaser.Scene,
    x: number,
    y: number,
    characterType: CharacterType,
    level?: number
  ): BaseCharacter {
    let character: BaseCharacter;
    
    // Map characterType to specific character classes
    switch (characterType) {
      case CharacterType.FAUNE:
        character = new Faune(scene, x, y, characterType, level);
        break;
      case CharacterType.SWORDSMAN:
        // Future implementation: new Swordsman(...)
        throw new Error('Swordsman character not implemented yet');
      default:
        throw new Error(`Unknown character type: ${characterType}`);
    }
    
    // Add to scene's display and update lists
    scene.add.existing(character);
    scene.physics.add.existing(character);
    
    // Set body size based on character config
    const config = CHARACTER_CONFIGS[characterType];
    if (character.body) {
      (character.body as Phaser.Physics.Arcade.Body).setSize(
        character.width * config.bodyWidthRatio,
        character.height * config.bodyHeightRatio
      );
    }
    
    return character;
  }

  /**
   * Gets all available character types
   */
  static getAvailableCharacterTypes(): CharacterType[] {
    return Object.values(CharacterType);
  }
}

