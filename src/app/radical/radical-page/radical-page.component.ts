import {Component, OnInit} from '@angular/core';
import Phaser from "phaser";
import {MainScene} from "../MainScene";

@Component({
    selector: 'game-radical-page',
    templateUrl: './radical-page.component.html',
    styleUrl: '/src/styles/_game-shared.scss',
    standalone: false,
    host: {
      class: 'block w-full h-full'
    }
})
export class RadicalPageComponent implements OnInit {
  private phaserGame!: Phaser.Game;
  private readonly config: Phaser.Types.Core.GameConfig;

  constructor() {
    this.config = {
      type: Phaser.AUTO,
      backgroundColor:0x222222,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: "radicalGameContainer",
        width: 320,
        height: 480
      },
      scene: [MainScene],
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 }
        }
      }
    };
  }

  ngOnInit(): void {
    this.phaserGame = new Phaser.Game(this.config);
  }
}
