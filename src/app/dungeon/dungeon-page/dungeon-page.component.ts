import {Component, OnInit} from '@angular/core';
import Phaser from "phaser";
import {Game} from "../scenes/Game";
import {Preloader} from "../scenes/Preloader";

@Component({
    selector: 'game-dungeon-page',
    templateUrl: './dungeon-page.component.html',
    styleUrl: './dungeon-page.component.scss',
    standalone: false
})
export class DungeonPageComponent implements OnInit {
  private phaserGame!: Phaser.Game;
  private readonly config: Phaser.Types.Core.GameConfig;

  constructor() {
    this.config = {
      type: Phaser.AUTO,
      width: 400,
      height: 250,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: true,
        }
      },
      scene: [ Preloader, Game ],
      parent: 'dungeonGameContainer',
      scale: {
        zoom: 2
      }
    };
  }

  ngOnInit(): void {
    this.phaserGame = new Phaser.Game(this.config);
  }
}
