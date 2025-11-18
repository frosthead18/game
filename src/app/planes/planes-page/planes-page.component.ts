import {Component, OnInit} from '@angular/core';
import Phaser from "phaser";
import {MainScene} from "../MainScene";

@Component({
    selector: 'game-planes-page',
    templateUrl: './planes-page.component.html',
    standalone: false,
    host: {
      class: 'block w-full h-full'
    }
})
export class PlanesPageComponent implements OnInit {
  private phaserGame!: Phaser.Game;
  private readonly config: Phaser.Types.Core.GameConfig;

  constructor() {
    this.config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      backgroundColor: '#2d2d2d',
      scene: [ MainScene ],
      parent: 'planesGameContainer',
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
