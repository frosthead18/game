/**
 * Shared constants for the dungeon game
 */

// Scene keys
export const SCENE_KEYS = {
  preloader: 'preloader',
  game: 'game'
} as const;

// Asset keys
export const ASSET_KEYS = {
  tiles: 'tiles',
  dungeon: 'dungeon',
  faune: 'faune',
  lizard: 'lizard'
} as const;

// Asset paths
export const ASSET_PATHS = {
  tiles: {
    image: 'assets/dungeon/tiles/dungeon_tiles.png',
    json: 'assets/dungeon/tiles/dungeon-01.json'
  },
  characters: {
    faune: {
      image: 'assets/dungeon/characters/fauna.png',
      atlas: 'assets/dungeon/characters/fauna.json'
    }
  },
  enemies: {
    lizard: {
      image: 'assets/dungeon/enemies/lizard.png',
      atlas: 'assets/dungeon/enemies/lizard.json'
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
    bodyHeightRatio: 0.8
  },
  lizard: {
    startX: 256,
    startY: 128,
    speed: 50,
    directionChangeDelay: 2000
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

