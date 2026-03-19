export enum UserRole {
  ADMIN = 'admin',
  PLAYER = 'player',
}

export enum GameType {
  DUNGEON = 'dungeon',
  BATTLE_ARMOUR = 'battle_armour',
  PLANES = 'planes',
}

export enum SessionStatus {
  WAITING = 'waiting',
  IN_PROGRESS = 'in_progress',
  FINISHED = 'finished',
}

export enum PlayerSessionStatus {
  READY = 'ready',
  PLAYING = 'playing',
  DEAD = 'dead',
  LEFT = 'left',
}

export enum CharacterType {
  FAUNE = 'faune',
  SWORDSMAN = 'swordsman',
}
