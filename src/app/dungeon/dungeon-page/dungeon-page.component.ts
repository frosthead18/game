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

  @HostListener('document:fullscreenchange')
  onFullscreenChange(): void {
    // If user exits fullscreen (ESC key or browser UI) while playing
    if (!document.fullscreenElement && this.viewState === 'playing' && !this.isDialogOpen) {
      // Pause the game immediately
      this.pauseGame();
      // Show exit confirmation dialog
      this.showExitConfirmation();
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

    dialogRef.afterClosed().subscribe(async result => {
      this.isDialogOpen = false;
      if (result === true) {
        // User chose to exit - cleanup and return to preview
        this.cleanupGame();
      } else {
        // User chose to continue - re-enter fullscreen and resume
        const container = document.getElementById('dungeonGameContainer');
        if (container) {
          try {
            await container.requestFullscreen();
            this.resumeGame();
          } catch (error) {
            console.error('Failed to re-enter fullscreen:', error);
            // If can't re-enter fullscreen, just resume the game
            this.resumeGame();
          }
        } else {
          // Container not found, just resume
          this.resumeGame();
        }
      }
    });
  }

  private pauseGame(): void {
    if (this.phaserGame) {
      this.phaserGame.scene.scenes.forEach(scene => {
        if (scene.scene.isActive()) {
          scene.scene.pause();
        }
      });
    }
  }

  private resumeGame(): void {
    if (this.phaserGame) {
      this.phaserGame.scene.scenes.forEach(scene => {
        if (scene.scene.isPaused()) {
          scene.scene.resume();
        }
      });
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
