import Phaser from 'phaser';

/**
 * EventsCenter - A singleton event emitter for cross-scene communication
 * Used to emit and listen to game events between different scenes and objects
 */
class EventsCenter extends Phaser.Events.EventEmitter {
  // Singleton instance
  private static instance: EventsCenter;

  private constructor() {
    super();
  }

  public static getInstance(): EventsCenter {
    if (!EventsCenter.instance) {
      EventsCenter.instance = new EventsCenter();
    }
    return EventsCenter.instance;
  }
}

// Export singleton instance
export const sceneEvents = EventsCenter.getInstance();

// Event name constants
export const EVENTS = {
  PLAYER_HEALTH_CHANGED: 'player-health-changed',
  PLAYER_COINS_CHANGED: 'player-coins-changed',
  PLAYER_DIED: 'player-died',
  CHEST_OPENED: 'chest-opened',
  PLAYER_XP_CHANGED: 'player-xp-changed',
  PLAYER_LEVEL_UP: 'player-level-up',
  ENEMY_DIED: 'enemy-died',
} as const;

