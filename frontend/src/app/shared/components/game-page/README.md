# GamePage Component

A reusable component that provides a fullscreen game experience with preview page, confirmation dialogs, and automatic game pause/resume functionality.

## Features

- **Preview Page**: Displays game title, description, and features list before gameplay
- **Fullscreen Mode**: Automatically enters fullscreen when user starts the game
- **Exit Confirmation**: Shows confirmation dialog when user presses ESC
- **Game Pause/Resume**: Automatically pauses game when dialog is shown
- **Easy Integration**: Simple configuration-based setup

## Usage

### 1. Import the Module

```typescript
import { GamePageModule } from '@shared/components/game-page/game-page.module';

@NgModule({
  imports: [
    GamePageModule,
    // ... other imports
  ]
})
export class YourGameModule { }
```

### 2. Configure Your Game

```typescript
import { Component } from '@angular/core';
import { GamePageConfig } from '@shared/components/game-page/game-page.component';
import Phaser from 'phaser';
import { YourGameScene } from './scenes/YourGameScene';
import { YourPreloaderScene } from './scenes/YourPreloaderScene';

@Component({
  selector: 'app-your-game-page',
  template: '<app-game-page [config]="gameConfig"></app-game-page>'
})
export class YourGamePageComponent {
  gameConfig: GamePageConfig = {
    gameTitle: 'My Awesome Game',
    gameDescription: 'An exciting adventure awaits!',
    features: [
      'Stunning graphics',
      'Challenging gameplay',
      'Epic boss battles',
      'Multiple levels'
    ],
    containerElementId: 'myGameContainer', // Optional, defaults to 'gameContainer'
    phaserConfig: {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      scene: [YourPreloaderScene, YourGameScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    }
  };
}
```

### 3. Use in Template

```html
<app-game-page [config]="gameConfig"></app-game-page>
```

## Configuration Options

### GamePageConfig Interface

```typescript
interface GamePageConfig {
  gameTitle: string;              // Title displayed on preview page
  gameDescription: string;        // Description displayed on preview page
  features: string[];             // Array of feature strings
  phaserConfig: Phaser.Types.Core.GameConfig;  // Your Phaser game configuration
  containerElementId?: string;    // Optional: Custom container ID (defaults to 'gameContainer')
}
```

## Behavior

1. **Preview Page**: Shown when component loads
2. **Play Button Click**: Opens fullscreen confirmation dialog
3. **Start Game**: Enters fullscreen and initializes Phaser game
4. **ESC Key Press**: Exits fullscreen, pauses game, shows exit confirmation
5. **Continue**: Re-enters fullscreen and resumes game
6. **Exit**: Returns to preview page and destroys game instance

## Notes

- The component automatically handles Phaser game lifecycle (create/destroy)
- Game is paused when exit confirmation dialog is shown
- Fullscreen API fallback: if fullscreen fails, game starts in normal mode
- All Phaser scenes are automatically paused/resumed

