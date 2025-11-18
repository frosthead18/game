import {Component, OnInit} from '@angular/core';
import {MainScene} from "../MainScene";
import Phaser from 'phaser';

@Component({
    selector: 'game-page-game-page',
    templateUrl: './game.component.html',
    styleUrl: './game.component.scss',
    standalone: false
})
export class GameComponent implements OnInit {
  private phaserGame!: Phaser.Game;
  private readonly config: Phaser.Types.Core.GameConfig;

  constructor() {
    this.config = {
      type: Phaser.AUTO,
      height: '100%',
      width: '100%',
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
    };
  }

  ngOnInit(): void {
    this.phaserGame = new Phaser.Game(this.config);
  }
}
