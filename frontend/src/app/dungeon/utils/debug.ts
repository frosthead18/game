import Phaser from 'phaser';

/**
 * Debug utility to draw collision shapes on a tilemap layer
 * Useful for visualizing collision tiles during development
 *
 * @param layer - The tilemap layer to debug
 * @param scene - The scene to draw the debug graphics in
 * @param alpha - Optional opacity for the debug graphics (default 0.75)
 */
export const debugDraw = (
  layer: Phaser.Tilemaps.TilemapLayer,
  scene: Phaser.Scene,
  alpha: number = 0.75
): void => {
  const debugGraphics = scene.add.graphics().setAlpha(alpha);

  layer.renderDebug(debugGraphics, {
    tileColor: null, // Non-colliding tiles - don't color
    collidingTileColor: new Phaser.Display.Color(243, 234, 48, 255), // Colliding tiles - yellow
    faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Colliding face - dark gray
  });
};

