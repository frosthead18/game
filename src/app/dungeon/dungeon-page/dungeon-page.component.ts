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
    gameDescription: 'Embark on an epic adventure through mysterious dungeons filled with treasures, enemies, and secrets waiting to be discovered.',
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
