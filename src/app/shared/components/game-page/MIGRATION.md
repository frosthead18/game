# Migration Guide: Using the Reusable GamePage Component

## Overview

The `GamePage` component has been created to encapsulate all fullscreen game functionality, making it easy to add fullscreen capabilities to any Phaser game in the application.

## What's Included

### Components Created:
- `src/app/shared/components/game-page/game-page.component.ts` - Main component
- `src/app/shared/components/game-page/game-page.component.html` - Template
- `src/app/shared/components/game-page/game-page.component.scss` - Styles
- `src/app/shared/components/game-page/game-page.module.ts` - Module
- `src/app/shared/components/game-page/fullscreen-confirm-dialog/` - Fullscreen confirmation dialog
- `src/app/shared/components/game-page/exit-confirm-dialog/` - Exit confirmation dialog

### Documentation:
- `README.md` - Complete usage documentation
- `MIGRATION.md` - This migration guide

## How to Migrate Existing Games

### Step 1: Import the Module

In your game module (e.g., `dungeon.module.ts`):

```typescript
import { GamePageModule } from '../shared/components/game-page/game-page.module';

@NgModule({
  declarations: [
    YourGamePageComponent
  ],
  imports: [
    CommonModule,
    GamePageModule  // Add this
  ]
})
export class YourGameModule { }
```

### Step 2: Simplify Your Game Page Component

**Before (Old Code):**
```typescript
import {Component, HostListener, OnDestroy} from '@angular/core';
import Phaser from "phaser";
// ... lots of imports and logic ...

@Component({
  selector: 'game-dungeon-page',
  templateUrl: './dungeon-page.component.html',
  standalone: false
})
export class DungeonPageComponent implements OnDestroy {
  viewState: ViewState = 'preview';
  private phaserGame?: Phaser.Game;
  // ... 150+ lines of complex logic ...
}
```

**After (New Code):**
```typescript
import {Component} from '@angular/core';
import {GamePageConfig} from '../../shared/components/game-page/game-page.component';
import {Game} from "../scenes/Game";
import {Preloader} from "../scenes/Preloader";
import {GameUI} from "../scenes/GameUI";
import Phaser from "phaser";

@Component({
  selector: 'game-dungeon-page',
  template: '<app-game-page [config]="gameConfig"></app-game-page>',
  standalone: false
})
export class DungeonPageComponent {
  gameConfig: GamePageConfig = {
    gameTitle: 'Dungeon Explorer',
    gameDescription: 'Embark on an epic adventure through mysterious dungeons...',
    features: [
      'Explore handcrafted dungeon levels with unique challenges',
      'Battle dangerous enemies and collect powerful items',
      'Smooth character controls and responsive gameplay',
      'Immersive fullscreen experience'
    ],
    containerElementId: 'dungeonGameContainer',
    phaserConfig: {
      type: Phaser.AUTO,
      width: 400,
      height: 250,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: {x: 0, y: 0},
          debug: true,
        }
      },
      scene: [Preloader, Game, GameUI],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    }
  };
}
```

### Step 3: Remove Old Files (Optional)

You can now safely remove:
- Old component HTML file (the template is now inline)
- Old fullscreen/exit dialog components (they're now in shared)
- All fullscreen management logic

## For New Games

Simply create a new component that uses `GamePageComponent`:

```typescript
import {Component} from '@angular/core';
import {GamePageConfig} from '@shared/components/game-page/game-page.component';
import Phaser from "phaser";
import {MyGameScene} from "./scenes/MyGameScene";

@Component({
  selector: 'app-my-game-page',
  template: '<app-game-page [config]="gameConfig"></app-game-page>'
})
export class MyGamePageComponent {
  gameConfig: GamePageConfig = {
    gameTitle: 'My Game',
    gameDescription: 'An awesome game description',
    features: [
      'Feature 1',
      'Feature 2',
      'Feature 3'
    ],
    phaserConfig: {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      scene: [MyGameScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    }
  };
}
```

## Benefits

✅ **Reduced Complexity**: Component went from 160+ lines to ~40 lines
✅ **Reusability**: Use the same fullscreen logic for all games
✅ **Maintainability**: Fix bugs in one place, all games benefit
✅ **Consistency**: All games have the same UX for fullscreen
✅ **Easy to Use**: Configuration-based approach
✅ **Type Safety**: TypeScript interfaces ensure correct usage

## Features Provided

- Fullscreen mode management
- Preview/landing page with game info
- Confirmation dialogs (enter/exit)
- Automatic game pause/resume
- ESC key handling
- Browser fullscreen exit detection
- Phaser game lifecycle management
- Fallback for browsers without fullscreen support

## Testing

After migration, test the following:
1. Preview page displays correctly
2. "Play Game" button shows confirmation dialog
3. Game enters fullscreen mode
4. ESC key shows exit confirmation (with game paused)
5. "Continue" resumes game in fullscreen
6. "Exit" returns to preview page
7. Browser fullscreen controls (F11) work correctly

