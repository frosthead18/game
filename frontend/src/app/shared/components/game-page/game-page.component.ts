import {Component, HostListener, Input, OnDestroy, OnInit} from '@angular/core';
import Phaser from 'phaser';
import {MatDialog} from '@angular/material/dialog';
import {FullscreenConfirmDialogComponent} from './fullscreen-confirm-dialog/fullscreen-confirm-dialog.component';
import {ExitConfirmDialogComponent} from './exit-confirm-dialog/exit-confirm-dialog.component';

export interface GamePageConfig {
  gameTitle: string;
  gameDescription: string;
  features: string[];
  phaserConfig: Phaser.Types.Core.GameConfig;
  containerElementId?: string;
}

type ViewState = 'preview' | 'playing';

@Component({
  selector: 'app-game-page',
  templateUrl: './game-page.component.html',
  standalone: false
})
export class GamePageComponent implements OnInit, OnDestroy {
  @Input() config!: GamePageConfig;

  viewState: ViewState = 'preview';
  private phaserGame?: Phaser.Game;
  private isDialogOpen = false;
  private containerElementId = 'gameContainer';

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    if (this.config.containerElementId) {
      this.containerElementId = this.config.containerElementId;
    }
    // Update Phaser config with the container ID
    if (this.config.phaserConfig) {
      this.config.phaserConfig.parent = this.containerElementId;
      if (this.config.phaserConfig.scale) {
        this.config.phaserConfig.scale.parent = this.containerElementId;
        this.config.phaserConfig.scale.fullscreenTarget = this.containerElementId;
      }
    }
  }

  ngOnDestroy(): void {
    this.cleanupGame();
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
      const container = document.getElementById(this.containerElementId);
      if (!container) {
        console.error('Game container not found');
        return;
      }

      try {
        await container.requestFullscreen();
        // Initialize game after entering fullscreen
        setTimeout(() => {
          this.phaserGame = new Phaser.Game(this.config.phaserConfig);
        }, 100);
      } catch (error) {
        console.error('Failed to enter fullscreen:', error);
        // Fallback: start game without fullscreen
        this.phaserGame = new Phaser.Game(this.config.phaserConfig);
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
        const container = document.getElementById(this.containerElementId);
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
}

