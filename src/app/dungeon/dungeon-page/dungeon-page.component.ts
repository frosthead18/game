import {Component, HostListener, OnDestroy} from '@angular/core';
import Phaser from "phaser";
import {Game} from "../scenes/Game";
import {Preloader} from "../scenes/Preloader";
import {GameUI} from "../scenes/GameUI";
import {MatDialog} from '@angular/material/dialog';
import {FullscreenConfirmDialogComponent} from '../dialogs/fullscreen-confirm-dialog.component';
import {ExitConfirmDialogComponent} from '../dialogs/exit-confirm-dialog.component';

type ViewState = 'preview' | 'playing';

@Component({
    selector: 'game-dungeon-page',
    templateUrl: './dungeon-page.component.html',
    standalone: false
})
export class DungeonPageComponent implements OnDestroy {
  viewState: ViewState = 'preview';
  private phaserGame?: Phaser.Game;
  private readonly config: Phaser.Types.Core.GameConfig;
  private isDialogOpen = false;

  constructor(private dialog: MatDialog) {
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
      scene: [ Preloader, Game, GameUI ],
      parent: 'dungeonGameContainer',
      scale: {
        mode: Phaser.Scale.FIT,
        parent: 'dungeonGameContainer',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        fullscreenTarget: 'dungeonGameContainer'
      }
    };
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapePressed(event: KeyboardEvent): void {
    if (this.viewState === 'playing' && !this.isDialogOpen) {
      event.preventDefault();
      this.showExitConfirmation();
    }
  }

  @HostListener('document:fullscreenchange')
  onFullscreenChange(): void {
    // If user exits fullscreen via browser UI (F11, etc.)
    if (!document.fullscreenElement && this.viewState === 'playing') {
      this.cleanupGame();
    }
  }

  onPlayClicked(): void {
    const dialogRef = this.dialog.open(FullscreenConfirmDialogComponent, {
      disableClose: true,
      width: '400px'
    });

    this.isDialogOpen = true;

    dialogRef.afterClosed().subscribe(result => {
      this.isDialogOpen = false;
      if (result === true) {
        this.enterFullscreen();
      }
    });
  }

  private async enterFullscreen(): Promise<void> {
    this.viewState = 'playing';
    
    // Wait for DOM to update and render the game container
    setTimeout(async () => {
      const container = document.getElementById('dungeonGameContainer');
      if (!container) {
        console.error('Game container not found');
        return;
      }

      try {
        await container.requestFullscreen();
        // Initialize game after entering fullscreen
        setTimeout(() => {
          this.phaserGame = new Phaser.Game(this.config);
        }, 100);
      } catch (error) {
        console.error('Failed to enter fullscreen:', error);
        // Fallback: start game without fullscreen
        this.phaserGame = new Phaser.Game(this.config);
      }
    }, 100);
  }

  private showExitConfirmation(): void {
    const dialogRef = this.dialog.open(ExitConfirmDialogComponent, {
      disableClose: true,
      width: '400px'
    });

    this.isDialogOpen = true;

    dialogRef.afterClosed().subscribe(result => {
      this.isDialogOpen = false;
      if (result === true) {
        this.exitFullscreen();
      }
    });
  }

  private async exitFullscreen(): Promise<void> {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Failed to exit fullscreen:', error);
    } finally {
      this.cleanupGame();
    }
  }

  private cleanupGame(): void {
    if (this.phaserGame) {
      this.phaserGame.destroy(true);
      this.phaserGame = undefined;
    }
    this.viewState = 'preview';
  }

  ngOnDestroy(): void {
    this.cleanupGame();
  }
}
