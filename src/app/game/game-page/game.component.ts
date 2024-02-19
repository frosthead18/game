import {Component, OnInit} from '@angular/core';
import Phaser from 'phaser';
import {MainScene} from "../MainScene";

@Component({
  selector: 'game-page-game-page',
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
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
          debug:true,
          gravity: { y: 0 }
        }
      },
    };
  }

  ngOnInit(): void {
    this.phaserGame = new Phaser.Game(this.config);
  }
}
