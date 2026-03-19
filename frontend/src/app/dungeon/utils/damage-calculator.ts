import { GAME_CONFIG } from '../constants';

/**
 * Result of a damage calculation
 */
export interface DamageResult {
  totalDamage: number;
  baseDamage: number;
  isCritical: boolean;
  damageVariation: number;
  levelBonus: number;
}

/**
 * Combat statistics for damage calculations
 */
export interface CombatStats {
  damage: number;
  defense: number;
  level: number;
  critChance?: number;
}

/**
 * Utility class for calculating damage with various modifiers
 */
export class DamageCalculator {
  /**
   * Calculate damage dealt by attacker to defender
   * @param attacker - Attacker's combat stats
   * @param defender - Defender's combat stats (optional)
   * @param customVariation - Custom damage variation (0-1 range), defaults to 0.2
   * @returns Detailed damage result
   */
  static calculateDamage(
    attacker: CombatStats,
    defender?: CombatStats,
    customVariation?: number
  ): DamageResult {
    const result: DamageResult = {
      totalDamage: 0,
      baseDamage: attacker.damage,
      isCritical: false,
      damageVariation: 0,
      levelBonus: 0
    };

    // 1. Base damage
    let damage = attacker.damage;

    // 2. Apply damage variation (randomness)
    const variation = customVariation ?? 0.2;
    const minMult = 1 - variation;
    const maxMult = 1 + variation;
    const randomMultiplier = Phaser.Math.FloatBetween(minMult, maxMult);
    damage *= randomMultiplier;
    result.damageVariation = randomMultiplier - 1;

    // 3. Check for critical hit
    const critChance = attacker.critChance ?? GAME_CONFIG.combat.criticalChance;
    if (Math.random() < critChance) {
      damage *= GAME_CONFIG.combat.criticalMultiplier;
      result.isCritical = true;
    }

    // 4. Apply level difference bonus (if defender exists)
    if (defender) {
      const levelDiff = attacker.level - defender.level;
      const levelBonus = Math.min(
        Math.max(levelDiff * GAME_CONFIG.combat.levelDifferenceBonus, -GAME_CONFIG.combat.maxLevelBonus),
        GAME_CONFIG.combat.maxLevelBonus
      );
      damage *= (1 + levelBonus);
      result.levelBonus = levelBonus;
    }

    // 5. Apply defender's defense (if exists)
    if (defender && defender.defense) {
      damage = Math.max(1, damage - defender.defense);
    }

    // 6. Round to nearest integer, ensure minimum damage
    result.totalDamage = Math.max(1, Math.round(damage));

    return result;
  }

  /**
   * Get a random damage value within the variation range
   * @param baseDamage - Base damage value
   * @param variation - Variation percentage (0-1 range)
   * @returns Random damage value
   */
  static getRandomDamage(baseDamage: number, variation: number = 0.2): number {
    const minDamage = baseDamage * (1 - variation);
    const maxDamage = baseDamage * (1 + variation);
    return Math.round(Phaser.Math.FloatBetween(minDamage, maxDamage));
  }

  /**
   * Calculate effective damage with level scaling
   * @param baseDamage - Base damage at level 1
   * @param level - Current level
   * @param damagePerLevel - Damage increase per level
   * @returns Scaled damage value
   */
  static getScaledDamage(baseDamage: number, level: number, damagePerLevel: number): number {
    return baseDamage + (level - 1) * damagePerLevel;
  }
}

