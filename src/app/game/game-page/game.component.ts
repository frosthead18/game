import {Component, OnInit} from '@angular/core';
import {MainScene} from "../MainScene";
import Phaser from 'phaser';

@Component({
    selector: 'game-page-game-page',
    templateUrl: './game.component.html',
    styleUrl: '/src/styles/_game-shared.scss',
    standalone: false,
    host: {
      class: 'block w-full h-full'
    }
})
export class GameComponent implements OnInit {
  private phaserGame!: Phaser.Game;
  private readonly config: Phaser.Types.Core.GameConfig;

  constructor() {
    this.config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      scene: [ MainScene ],
      parent: 'gameContainer',
      title: "Grim RPG",
      backgroundColor: "#18216D",
      physics: {
        default: 'matter',
        matter: {
          debug: false,
          gravity: { x: 0, y: 0 }
        }
      },
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
