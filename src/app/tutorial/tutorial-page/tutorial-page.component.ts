import {Component, OnInit} from '@angular/core';
import {MainScene} from "../MainScene";
import Phaser from "phaser";

@Component({
  selector: 'game-tutorial-page',
  templateUrl: './tutorial-page.component.html',
  styleUrl: './tutorial-page.component.scss'
})
export class TutorialPageComponent implements OnInit {
  private phaserGame!: Phaser.Game;
  private readonly config: Phaser.Types.Core.GameConfig;

  constructor() {
    this.config = {
      type: Phaser.AUTO,
      width: '800',
      height: '600',
      parent: 'gameContainer',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 300 },
          debug: false
        }
      },
      scene: [MainScene]
    };
  }

  ngOnInit(): void {
    this.phaserGame = new Phaser.Game(this.config);
  }
}
