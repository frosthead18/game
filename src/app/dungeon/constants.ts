/**
 * Shared constants for the dungeon game
 */

// Scene keys
export const SCENE_KEYS = {
  preloader: 'preloader',
  game: 'game',
  gameUI: 'game-ui'
} as const;

// Enemy types enum
export enum EnemyType {
  ANGEL = 'angel',
  BIG_DEMON = 'big_demon',
  BIG_ZOMBIE = 'big_zombie',
  CHORT = 'chort',
  DOC = 'doc',
  DWARF_F = 'dwarf_f',
  DWARF_M = 'dwarf_m',
  ELF_F = 'elf_f',
  ELF_M = 'elf_m',
  GOBLIN = 'goblin',
  ICE_ZOMBIE = 'ice_zombie',
  IMP = 'imp',
  KNIGHT_F = 'knight_f',
  KNIGHT_M = 'knight_m',
  LIZARD = 'lizard',
  LIZARD_F = 'lizard_f',
  LIZARD_M = 'lizard_m',
  MASKED_ORC = 'masked_orc',
  MUDDY = 'muddy',
  NECROMANCER = 'necromancer',
  OGRE = 'ogre',
  ORC_SHAMAN = 'orc_shaman',
  ORC_WARRIOR = 'orc_warrior',
  ORK_WARRIOR = 'ork_warrior',
  PUMPKIN = 'pumpkin',
  SKELET = 'skelet',
  SLUG = 'slug',
  SWAMPY = 'swampy',
  TINY_SLUG = 'tiny_slug',
  TINY_ZOMBIE = 'tiny_zombie',
  WIZZARD_F = 'wizzard_f',
  WIZZARD_M = 'wizzard_m',
  WOGOL = 'wogol',
  ZOMBIE = 'zombie'
}

// Asset keys
export const ASSET_KEYS = {
  tiles: 'tiles',
  dungeon: 'dungeon',
  faune: 'faune',
  lizard: 'lizard',
  treasure: 'treasure',
  knife: 'knife',
  uiHeart: 'ui-heart',
  // Enemy keys
  ...Object.fromEntries(
    Object.values(EnemyType).map(type => [type, type])
  )
} as const;

// Asset paths
export const ASSET_PATHS = {
  tiles: {
    image: 'assets/dungeon/tiles/dungeon_tiles.png',
    json: 'assets/dungeon/tiles/dungeon-01.json'
  },
  characters: {
    faune: {
      image: 'assets/dungeon/characters/faune.png',
      atlas: 'assets/dungeon/characters/faune.json'
    }
  },
  enemies: {
    lizard: {
      image: 'assets/dungeon/enemies/lizard_m.png',
      atlas: 'assets/dungeon/enemies/lizard_m.json'
    },
    angel: {
      image: 'assets/dungeon/enemies/angel.png',
      atlas: 'assets/dungeon/enemies/angel.json'
    },
    big_demon: {
      image: 'assets/dungeon/enemies/big_demon.png',
      atlas: 'assets/dungeon/enemies/big_demon.json'
    },
    big_zombie: {
      image: 'assets/dungeon/enemies/big_zombie.png',
      atlas: 'assets/dungeon/enemies/big_zombie.json'
    },
    chort: {
      image: 'assets/dungeon/enemies/chort.png',
      atlas: 'assets/dungeon/enemies/chort.json'
    },
    doc: {
      image: 'assets/dungeon/enemies/doc.png',
      atlas: 'assets/dungeon/enemies/doc.json'
    },
    dwarf_f: {
      image: 'assets/dungeon/enemies/dwarf_f.png',
      atlas: 'assets/dungeon/enemies/dwarf_f.json'
    },
    dwarf_m: {
      image: 'assets/dungeon/enemies/dwarf_m.png',
      atlas: 'assets/dungeon/enemies/dwarf_m.json'
    },
    elf_f: {
      image: 'assets/dungeon/enemies/elf_f.png',
      atlas: 'assets/dungeon/enemies/elf_f.json'
    },
    elf_m: {
      image: 'assets/dungeon/enemies/elf_m.png',
      atlas: 'assets/dungeon/enemies/elf_m.json'
    },
    goblin: {
      image: 'assets/dungeon/enemies/goblin.png',
      atlas: 'assets/dungeon/enemies/goblin.json'
    },
    ice_zombie: {
      image: 'assets/dungeon/enemies/ice_zombie.png',
      atlas: 'assets/dungeon/enemies/ice_zombie.json'
    },
    imp: {
      image: 'assets/dungeon/enemies/imp.png',
      atlas: 'assets/dungeon/enemies/imp.json'
    },
    knight_f: {
      image: 'assets/dungeon/enemies/knight_f.png',
      atlas: 'assets/dungeon/enemies/knight_f.json'
    },
    knight_m: {
      image: 'assets/dungeon/enemies/knight_m.png',
      atlas: 'assets/dungeon/enemies/knight_m.json'
    },
    lizard_f: {
      image: 'assets/dungeon/enemies/lizard_f.png',
      atlas: 'assets/dungeon/enemies/lizard_f.json'
    },
    lizard_m: {
      image: 'assets/dungeon/enemies/lizard_m.png',
      atlas: 'assets/dungeon/enemies/lizard_m.json'
    },
    masked_orc: {
      image: 'assets/dungeon/enemies/masked_orc.png',
      atlas: 'assets/dungeon/enemies/masked_orc.json'
    },
    muddy: {
      image: 'assets/dungeon/enemies/muddy.png',
      atlas: 'assets/dungeon/enemies/muddy.json'
    },
    necromancer: {
      image: 'assets/dungeon/enemies/necromancer.png',
      atlas: 'assets/dungeon/enemies/necromancer.json'
    },
    ogre: {
      image: 'assets/dungeon/enemies/ogre.png',
      atlas: 'assets/dungeon/enemies/ogre.json'
    },
    orc_shaman: {
      image: 'assets/dungeon/enemies/orc_shaman.png',
      atlas: 'assets/dungeon/enemies/orc_shaman.json'
    },
    orc_warrior: {
      image: 'assets/dungeon/enemies/orc_warrior.png',
      atlas: 'assets/dungeon/enemies/orc_warrior.json'
    },
    ork_warrior: {
      image: 'assets/dungeon/enemies/ork_warrior.png',
      atlas: 'assets/dungeon/enemies/ork_warrior.json'
    },
    pumpkin: {
      image: 'assets/dungeon/enemies/pumpkin.png',
      atlas: 'assets/dungeon/enemies/pumpkin.json'
    },
    skelet: {
      image: 'assets/dungeon/enemies/skelet.png',
      atlas: 'assets/dungeon/enemies/skelet.json'
    },
    slug: {
      image: 'assets/dungeon/enemies/slug.png',
      atlas: 'assets/dungeon/enemies/slug.json'
    },
    swampy: {
      image: 'assets/dungeon/enemies/swampy.png',
      atlas: 'assets/dungeon/enemies/swampy.json'
    },
    tiny_slug: {
      image: 'assets/dungeon/enemies/tiny_slug.png',
      atlas: 'assets/dungeon/enemies/tiny_slug.json'
    },
    tiny_zombie: {
      image: 'assets/dungeon/enemies/tiny_zombie.png',
      atlas: 'assets/dungeon/enemies/tiny_zombie.json'
    },
    wizzard_f: {
      image: 'assets/dungeon/enemies/wizzard_f.png',
      atlas: 'assets/dungeon/enemies/wizzard_f.json'
    },
    wizzard_m: {
      image: 'assets/dungeon/enemies/wizzard_m.png',
      atlas: 'assets/dungeon/enemies/wizzard_m.json'
    },
    wogol: {
      image: 'assets/dungeon/enemies/wogol.png',
      atlas: 'assets/dungeon/enemies/wogol.json'
    },
    zombie: {
      image: 'assets/dungeon/enemies/zombie.png',
      atlas: 'assets/dungeon/enemies/zombie.json'
    }
  },
  items: {
    treasure: {
      image: 'assets/dungeon/items/treasure.png',
      atlas: 'assets/dungeon/items/treasure.json'
    }
  },
  weapons: {
    knife: {
      image: 'assets/dungeon/weapons/weapon_knife.png',
      atlas: 'assets/dungeon/weapons/weapon_knife.json'
    }
  },
  ui: {
    heart: {
      image: 'assets/dungeon/ui/ui_heart.png',
      atlas: 'assets/dungeon/ui/ui_heart.json'
    }
  }
} as const;

// Game configuration
export const GAME_CONFIG = {
  player: {
    startX: 128,
    startY: 128,
    speed: 100,
    bodyWidthRatio: 0.5,
    bodyHeightRatio: 0.8,
    maxHealth: 3,
    knockbackSpeed: 200,
    damageTimeDelay: 250
  },
  lizard: {
    startX: 256,
    startY: 128,
    baseSpeed: 50,
    baseDamage: 1,
    baseHp: 1,
    directionChangeDelay: 2000,
    hpScaleFactor: 0.5,
    speedScaleFactor: 0.1,
    minLevel: 1,
    maxLevel: 10,
    defaultLevel: 1,
    spawnCount: 35,
    minSpawnDistance: 150,
    spawnAreaMargin: 50,
    maxSpawnAttempts: 50
  },
  knife: {
    speed: 300,
    damage: 1
  },
  chest: {
    coinsValue: 50
  },
  debug: {
    collisionAlpha: 0.7
  }
} as const;

// Animation configuration
export const ANIMATION_CONFIG = {
  repeatInfinite: -1,
  faune: {
    frameRate: 15,
    runFrameStart: 1,
    runFrameEnd: 8
  },
  lizard: {
    frameRate: 10,
    frameStart: 0,
    frameEnd: 3
  },
  enemy: {
    frameRate: 10,
    frameStart: 0,
    frameEnd: 3
  }
} as const;

// Animation types
export type AnimationType = 'standard' | 'advanced' | 'simple';

// Enemy configuration interface
export interface EnemyConfig {
  animationType: AnimationType;
  baseSpeed: number;
  baseDamage: number;
  baseHp: number;
  scale?: number;
  idleFramePrefix?: string;
  runFramePrefix?: string;
  hitFramePrefix?: string;
  animFramePrefix?: string;
}

// Enemy configurations
export const ENEMY_CONFIGS: Record<EnemyType, EnemyConfig> = {
  // Standard enemies (idle + run)
  [EnemyType.ANGEL]: {
    animationType: 'standard',
    baseSpeed: 45,
    baseDamage: 2,
    baseHp: 2,
    idleFramePrefix: 'angel_idle_anim_f',
    runFramePrefix: 'angel_run_anim_f'
  },
  [EnemyType.BIG_DEMON]: {
    animationType: 'standard',
    baseSpeed: 40,
    baseDamage: 3,
    baseHp: 3,
    scale: 1.2,
    idleFramePrefix: 'big_demon_idle_anim_f',
    runFramePrefix: 'big_demon_run_anim_f'
  },
  [EnemyType.BIG_ZOMBIE]: {
    animationType: 'standard',
    baseSpeed: 35,
    baseDamage: 3,
    baseHp: 4,
    scale: 1.2,
    idleFramePrefix: 'big_zombie_idle_anim_f',
    runFramePrefix: 'big_zombie_run_anim_f'
  },
  [EnemyType.CHORT]: {
    animationType: 'standard',
    baseSpeed: 55,
    baseDamage: 2,
    baseHp: 2,
    idleFramePrefix: 'chort_idle_anim_f',
    runFramePrefix: 'chort_run_anim_f'
  },
  [EnemyType.DOC]: {
    animationType: 'standard',
    baseSpeed: 50,
    baseDamage: 1,
    baseHp: 2,
    idleFramePrefix: 'doc_idle_anim_f',
    runFramePrefix: 'doc_run_anim_f'
  },
  [EnemyType.GOBLIN]: {
    animationType: 'standard',
    baseSpeed: 60,
    baseDamage: 1,
    baseHp: 1,
    idleFramePrefix: 'goblin_idle_anim_f',
    runFramePrefix: 'goblin_run_anim_f'
  },
  [EnemyType.IMP]: {
    animationType: 'standard',
    baseSpeed: 65,
    baseDamage: 1,
    baseHp: 1,
    idleFramePrefix: 'imp_idle_anim_f',
    runFramePrefix: 'imp_run_anim_f'
  },
  [EnemyType.MASKED_ORC]: {
    animationType: 'standard',
    baseSpeed: 50,
    baseDamage: 2,
    baseHp: 2,
    idleFramePrefix: 'masked_orc_idle_anim_f',
    runFramePrefix: 'masked_orc_run_anim_f'
  },
  [EnemyType.OGRE]: {
    animationType: 'standard',
    baseSpeed: 40,
    baseDamage: 3,
    baseHp: 4,
    scale: 1.3,
    idleFramePrefix: 'ogre_idle_anim_f',
    runFramePrefix: 'ogre_run_anim_f'
  },
  [EnemyType.ORC_SHAMAN]: {
    animationType: 'standard',
    baseSpeed: 45,
    baseDamage: 2,
    baseHp: 2,
    idleFramePrefix: 'orc_shaman_idle_anim_f',
    runFramePrefix: 'orc_shaman_run_anim_f'
  },
  [EnemyType.ORC_WARRIOR]: {
    animationType: 'standard',
    baseSpeed: 50,
    baseDamage: 2,
    baseHp: 3,
    idleFramePrefix: 'pumpkin_dude_idle_anim_f',
    runFramePrefix: 'pumpkin_dude_run_anim_f'
  },
  [EnemyType.ORK_WARRIOR]: {
    animationType: 'standard',
    baseSpeed: 50,
    baseDamage: 2,
    baseHp: 3,
    idleFramePrefix: 'orc_warrior_idle_anim_f',
    runFramePrefix: 'orc_warrior_run_anim_f'
  },
  [EnemyType.PUMPKIN]: {
    animationType: 'standard',
    baseSpeed: 55,
    baseDamage: 2,
    baseHp: 2,
    idleFramePrefix: 'pumpkin_dude_idle_anim_f',
    runFramePrefix: 'pumpkin_dude_run_anim_f'
  },
  [EnemyType.SKELET]: {
    animationType: 'standard',
    baseSpeed: 55,
    baseDamage: 1,
    baseHp: 1,
    idleFramePrefix: 'skelet_idle_anim_f',
    runFramePrefix: 'skelet_run_anim_f'
  },
  [EnemyType.TINY_ZOMBIE]: {
    animationType: 'standard',
    baseSpeed: 45,
    baseDamage: 1,
    baseHp: 1,
    scale: 0.8,
    idleFramePrefix: 'tiny_zombie_idle_anim_f',
    runFramePrefix: 'tiny_zombie_run_anim_f'
  },
  [EnemyType.WOGOL]: {
    animationType: 'standard',
    baseSpeed: 50,
    baseDamage: 2,
    baseHp: 2,
    idleFramePrefix: 'wogol_idle_anim_f',
    runFramePrefix: 'wogol_run_anim_f'
  },

  // Advanced enemies (hit + idle + run)
  [EnemyType.DWARF_F]: {
    animationType: 'advanced',
    baseSpeed: 45,
    baseDamage: 2,
    baseHp: 3,
    hitFramePrefix: 'dwarf_f_hit_anim_f',
    idleFramePrefix: 'dwarf_f_idle_anim_f',
    runFramePrefix: 'dwarf_f_run_anim_f'
  },
  [EnemyType.DWARF_M]: {
    animationType: 'advanced',
    baseSpeed: 45,
    baseDamage: 2,
    baseHp: 3,
    hitFramePrefix: 'dwarf_m_hit_anim_f',
    idleFramePrefix: 'dwarf_m_idle_anim_f',
    runFramePrefix: 'dwarf_m_run_anim_f'
  },
  [EnemyType.ELF_F]: {
    animationType: 'advanced',
    baseSpeed: 60,
    baseDamage: 1,
    baseHp: 2,
    hitFramePrefix: 'elf_f_hit_anim_f',
    idleFramePrefix: 'elf_f_idle_anim_f',
    runFramePrefix: 'elf_f_run_anim_f'
  },
  [EnemyType.ELF_M]: {
    animationType: 'advanced',
    baseSpeed: 60,
    baseDamage: 1,
    baseHp: 2,
    hitFramePrefix: 'elf_m_hit_anim_f',
    idleFramePrefix: 'elf_m_idle_anim_f',
    runFramePrefix: 'elf_m_run_anim_f'
  },
  [EnemyType.KNIGHT_F]: {
    animationType: 'advanced',
    baseSpeed: 40,
    baseDamage: 3,
    baseHp: 4,
    hitFramePrefix: 'knight_f_hit_anim_f',
    idleFramePrefix: 'knight_f_idle_anim_f',
    runFramePrefix: 'knight_f_run_anim_f'
  },
  [EnemyType.KNIGHT_M]: {
    animationType: 'advanced',
    baseSpeed: 40,
    baseDamage: 3,
    baseHp: 4,
    hitFramePrefix: 'knight_m_hit_anim_f',
    idleFramePrefix: 'knight_m_idle_anim_f',
    runFramePrefix: 'knight_m_run_anim_f'
  },
  [EnemyType.LIZARD]: {
    animationType: 'standard',
    baseSpeed: 50,
    baseDamage: 1,
    baseHp: 1,
    idleFramePrefix: 'lizard_m_idle_anim_f',
    runFramePrefix: 'lizard_m_run_anim_f'
  },
  [EnemyType.LIZARD_F]: {
    animationType: 'advanced',
    baseSpeed: 50,
    baseDamage: 1,
    baseHp: 2,
    hitFramePrefix: 'lizard_f_hit_anim_f',
    idleFramePrefix: 'lizard_f_idle_anim_f',
    runFramePrefix: 'lizard_f_run_anim_f'
  },
  [EnemyType.LIZARD_M]: {
    animationType: 'advanced',
    baseSpeed: 50,
    baseDamage: 1,
    baseHp: 2,
    hitFramePrefix: 'lizard_m_hit_anim_f',
    idleFramePrefix: 'lizard_m_idle_anim_f',
    runFramePrefix: 'lizard_m_run_anim_f'
  },
  [EnemyType.WIZZARD_F]: {
    animationType: 'advanced',
    baseSpeed: 45,
    baseDamage: 2,
    baseHp: 2,
    hitFramePrefix: 'wizzard_f_hit_anim_f',
    idleFramePrefix: 'wizzard_f_idle_anim_f',
    runFramePrefix: 'wizzard_f_run_anim_f'
  },
  [EnemyType.WIZZARD_M]: {
    animationType: 'advanced',
    baseSpeed: 45,
    baseDamage: 2,
    baseHp: 2,
    hitFramePrefix: 'wizzard_m_hit_anim_f',
    idleFramePrefix: 'wizzard_m_idle_anim_f',
    runFramePrefix: 'wizzard_m_run_anim_f'
  },

  // Simple enemies (single animation)
  [EnemyType.ICE_ZOMBIE]: {
    animationType: 'simple',
    baseSpeed: 30,
    baseDamage: 2,
    baseHp: 3,
    animFramePrefix: 'ice_zombie_anim_f'
  },
  [EnemyType.MUDDY]: {
    animationType: 'simple',
    baseSpeed: 25,
    baseDamage: 1,
    baseHp: 2,
    animFramePrefix: 'muddy_anim_f'
  },
  [EnemyType.NECROMANCER]: {
    animationType: 'simple',
    baseSpeed: 40,
    baseDamage: 2,
    baseHp: 3,
    animFramePrefix: 'necromancer_anim_f'
  },
  [EnemyType.SLUG]: {
    animationType: 'simple',
    baseSpeed: 20,
    baseDamage: 1,
    baseHp: 2,
    animFramePrefix: 'slug_anim_f'
  },
  [EnemyType.SWAMPY]: {
    animationType: 'simple',
    baseSpeed: 25,
    baseDamage: 1,
    baseHp: 2,
    animFramePrefix: 'swampy_anim_f'
  },
  [EnemyType.TINY_SLUG]: {
    animationType: 'simple',
    baseSpeed: 30,
    baseDamage: 1,
    baseHp: 1,
    scale: 0.7,
    animFramePrefix: 'tiny_slug_anim_f'
  },
  [EnemyType.ZOMBIE]: {
    animationType: 'simple',
    baseSpeed: 35,
    baseDamage: 2,
    baseHp: 2,
    animFramePrefix: 'zombie_anim_f'
  }
} as const;

