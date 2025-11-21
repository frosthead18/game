import {Component, OnInit} from '@angular/core';
import {MainScene} from "../MainScene";
import Phaser from "phaser";

@Component({
    selector: 'game-tutorial-page',
    templateUrl: './tutorial-page.component.html',
    styleUrl: '/src/styles/_game-shared.scss',
    standalone: false,
    host: {
      class: 'block w-full h-full'
    }
})
export class TutorialPageComponent implements OnInit {
  private phaserGame!: Phaser.Game;
  private readonly config: Phaser.Types.Core.GameConfig;

  constructor() {
    this.config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: 'tutorialGameContainer',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 300 },
          debug: false
        }
      },
      scene: [MainScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600
      }
    };
  }

  ngOnInit(): void {
    this.phaserGame = new Phaser.Game(this.config);
  }
}
