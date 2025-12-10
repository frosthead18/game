import {BaseEnemy} from "./BaseEnemy";
import {EnemyType} from "../constants";

/**
 * Factory class for creating enemy instances
 */
export class EnemyFactory {
  /**
   * Creates an enemy of the specified type
   */
  static createEnemy(
    scene: Phaser.Scene,
    x: number,
    y: number,
    enemyType: EnemyType,
    level?: number
  ): BaseEnemy {
    const enemy = new BaseEnemy(scene, x, y, enemyType, undefined, level);
    
    // Add to scene's display and update lists
    scene.add.existing(enemy);
    scene.physics.add.existing(enemy);
    
    // Enable collision events
    if (enemy.body) {
      (enemy.body as Phaser.Physics.Arcade.Body).onCollide = true;
    }
    
    // Initialize animation
    enemy.init();
    
    return enemy;
  }

  /**
   * Gets a random enemy type from all available types
   */
  static getRandomEnemyType(): EnemyType {
    const types = Object.values(EnemyType);
    const randomIndex = Phaser.Math.Between(0, types.length - 1);
    return types[randomIndex];
  }

  /**
   * Gets a random enemy type with weighted distribution
   * This allows for more common and rare enemy types
   */
  static getWeightedRandomEnemyType(weights?: Partial<Record<EnemyType, number>>): EnemyType {
    if (!weights) {
      return EnemyFactory.getRandomEnemyType();
    }

    // Build weighted array
    const weightedTypes: EnemyType[] = [];
    
    Object.entries(weights).forEach(([type, weight]) => {
      for (let i = 0; i < weight; i++) {
        weightedTypes.push(type as EnemyType);
      }
    });

    // Fill in any missing types with default weight of 1
    Object.values(EnemyType).forEach(type => {
      if (!weights[type]) {
        weightedTypes.push(type);
      }
    });

    const randomIndex = Phaser.Math.Between(0, weightedTypes.length - 1);
    return weightedTypes[randomIndex];
  }

  /**
   * Gets a random enemy type from a specific subset
   */
  static getRandomEnemyTypeFromSubset(subset: EnemyType[]): EnemyType {
    const randomIndex = Phaser.Math.Between(0, subset.length - 1);
    return subset[randomIndex];
  }
}

