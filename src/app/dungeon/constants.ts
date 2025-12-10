/**
 * Shared constants for the dungeon game
 */

// Scene keys
export const SCENE_KEYS = {
  preloader: 'preloader',
  game: 'game',
  gameUI: 'game-ui'
} as const;

// Asset keys
export const ASSET_KEYS = {
  tiles: 'tiles',
  dungeon: 'dungeon',
  faune: 'faune',
  lizard: 'lizard',
  treasure: 'treasure',
  knife: 'knife',
  uiHeart: 'ui-heart'
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
    spawnCount: 30,
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
  }
} as const;

