import {BaseNPC} from "./BaseNPC";
import {NPCType} from "../constants";

/**
 * Factory class for creating NPC instances
 */
export class NPCFactory {
  /**
   * Creates an NPC of the specified type
   */
  static createNPC(
    scene: Phaser.Scene,
    x: number,
    y: number,
    NPCType: NPCType,
    level?: number
  ): BaseNPC {
    const npc = new BaseNPC(scene, x, y, NPCType, undefined, level);

    // Add to scene's display and update lists
    scene.add.existing(npc);
    scene.physics.add.existing(npc);

    // Enable collision events
    if (npc.body) {
      (npc.body as Phaser.Physics.Arcade.Body).onCollide = true;
    }

    // Initialize animation
    npc.init();

    return npc;
  }

  /**
   * Gets a random NPC type from all available types
   */
  static getRandomNPCType(): NPCType {
    const types = Object.values(NPCType);
    const randomIndex = Phaser.Math.Between(0, types.length - 1);
    return types[randomIndex];
  }

  /**
   * Gets a random NPC type with weighted distribution
   * This allows for more common and rare NPC types
   */
  static getWeightedRandomNPCType(weights?: Partial<Record<NPCType, number>>): NPCType {
    if (!weights) {
      return NPCFactory.getRandomNPCType();
    }

    // Build weighted array
    const weightedTypes: NPCType[] = [];

    Object.entries(weights).forEach(([type, weight]) => {
      for (let i = 0; i < weight; i++) {
        weightedTypes.push(type as NPCType);
      }
    });

    // Fill in any missing types with default weight of 1
    Object.values(NPCType).forEach(type => {
      if (!weights[type]) {
        weightedTypes.push(type);
      }
    });

    const randomIndex = Phaser.Math.Between(0, weightedTypes.length - 1);
    return weightedTypes[randomIndex];
  }

  /**
   * Gets a random NPC type from a specific subset
   */
  static getRandomNPCTypeFromSubset(subset: NPCType[]): NPCType {
    const randomIndex = Phaser.Math.Between(0, subset.length - 1);
    return subset[randomIndex];
  }
}

