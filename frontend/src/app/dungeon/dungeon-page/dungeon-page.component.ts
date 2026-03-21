import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { firstValueFrom, Subscription } from 'rxjs';
import Phaser from 'phaser';
import { MatDialog } from '@angular/material/dialog';
import { Game } from '../scenes/Game';
import { Preloader } from '../scenes/Preloader';
import { GameUI } from '../scenes/GameUI';
import { GameSessionService, GameSessionDto } from '../services/game-session.service';
import { AuthService } from '../../auth/auth.service';
import { FullscreenConfirmDialogComponent } from '../../shared/components/game-page/fullscreen-confirm-dialog/fullscreen-confirm-dialog.component';
import { ExitConfirmDialogComponent } from '../../shared/components/game-page/exit-confirm-dialog/exit-confirm-dialog.component';


type ViewState = 'preview' | 'session-list' | 'session-lobby' | 'playing';

@Component({
  selector: 'game-dungeon-page',
  templateUrl: './dungeon-page.component.html',
  standalone: false,
})
export class DungeonPageComponent implements OnInit, OnDestroy {
  viewState: ViewState = 'preview';
  sessions: GameSessionDto[] = [];
  currentSession: GameSessionDto | null = null;
  loading = false;
  errorMessage = '';
  isHost = false;

  private sessionId = '';
  private phaserGame?: Phaser.Game;
  private subs = new Subscription();
  private isDialogOpen = false;
  private stateBeforePlaying: ViewState = 'preview';

  constructor(
    private readonly sessionService: GameSessionService,
    private readonly authService: AuthService,
    private readonly dialog: MatDialog,
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.sessionService.disconnectSocket();
    this.destroyPhaser();
  }

  @HostListener('document:fullscreenchange')
  onFullscreenChange(): void {
    if (!document.fullscreenElement && this.viewState === 'playing' && !this.isDialogOpen) {
      this.pausePhaser();
      this.showExitConfirmation();
    }
  }

  // ─── Preview ────────────────────────────────────────────────────────────────

  onSinglePlayer(): void {
    this.showFullscreenConfirm('preview');
  }

  onMultiplayer(): void {
    this.viewState = 'session-list';
    this.loadSessions();
  }

  // ─── Session list ────────────────────────────────────────────────────────────

  onBack(): void {
    this.viewState = 'preview';
    this.sessions = [];
    this.errorMessage = '';
  }

  async loadSessions(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';
    try {
      this.sessions = await firstValueFrom(this.sessionService.listSessions('dungeon'));
    } catch {
      this.errorMessage = 'Failed to load sessions. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  async onCreateSession(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';
    try {
      const user = await firstValueFrom(this.authService.user$);
      const name = `${user?.email ?? 'Player'}'s Game`;
      const session = await firstValueFrom(this.sessionService.createSession(name));
      this.sessionId = session.id;
      await this.enterLobby(session);
    } catch {
      this.errorMessage = 'Failed to create session. Please try again.';
      this.loading = false;
    }
  }

  async onJoinSession(session: GameSessionDto): Promise<void> {
    this.loading = true;
    this.errorMessage = '';
    try {
      await firstValueFrom(this.sessionService.joinSession(session.id));
      this.sessionId = session.id;
      await this.enterLobby(session);
    } catch {
      this.errorMessage = 'Could not join session. It may have started or is full.';
      this.loading = false;
    }
  }

  // ─── Lobby ───────────────────────────────────────────────────────────────────

  private async enterLobby(initialSession: GameSessionDto): Promise<void> {
    try {
      await this.sessionService.connectSocket();
      this.sessionService.joinSessionRoom(this.sessionId);
      this.subscribeToSocketEvents();
      this.currentSession = initialSession;
      this.loading = false;
      this.viewState = 'session-lobby';
    } catch {
      this.errorMessage = 'Could not connect to game server.';
      this.loading = false;
    }
  }

  private subscribeToSocketEvents(): void {
    this.subs.add(
      this.sessionService.sessionState.subscribe(state => {
        if (state) {
          this.currentSession = state;
          this.updateHostStatus();
        }
      }),
    );

    this.subs.add(
      this.sessionService.sessionStarted.subscribe(() => {
        this.showFullscreenConfirm('session-lobby');
      }),
    );
  }

  private updateHostStatus(): void {
    if (!this.currentSession) return;
    // currentUserId is the Cognito sub, decoded from the JWT after connecting
    this.isHost = this.sessionService.currentUserId === this.currentSession.hostUserId;
  }

  onStartSession(): void {
    this.showFullscreenConfirm('session-lobby', () => {
      this.sessionService.startSession(this.sessionId);
    });
  }

  async onLeaveSession(): Promise<void> {
    try {
      this.sessionService.leaveSessionRoom(this.sessionId);
      await firstValueFrom(this.sessionService.leaveSession(this.sessionId));
    } catch {
      // best-effort leave
    } finally {
      this.sessionService.disconnectSocket();
      this.subs.unsubscribe();
      this.subs = new Subscription();
      this.currentSession = null;
      this.sessionId = '';
      this.isHost = false;
      this.viewState = 'session-list';
      this.loadSessions();
    }
  }

  // ─── Dialogs ─────────────────────────────────────────────────────────────────

  private showFullscreenConfirm(returnTo: ViewState, beforeLaunch?: () => void): void {
    const dialogRef = this.dialog.open(FullscreenConfirmDialogComponent, {
      disableClose: true,
      width: '400px',
    });

    this.isDialogOpen = true;

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      this.isDialogOpen = false;
      if (confirmed) {
        beforeLaunch?.();
        this.stateBeforePlaying = returnTo;
        this.enterFullscreenAndLaunch();
      }
    });
  }

  private showExitConfirmation(): void {
    const dialogRef = this.dialog.open(ExitConfirmDialogComponent, {
      disableClose: true,
      width: '400px',
    });

    this.isDialogOpen = true;

    dialogRef.afterClosed().subscribe(async (exit: boolean) => {
      this.isDialogOpen = false;
      if (exit) {
        this.destroyPhaser();
        this.viewState = this.stateBeforePlaying;
      } else {
        const container = document.getElementById('dungeonGameContainer');
        if (container) {
          try {
            await container.requestFullscreen();
          } catch {
            // resume without fullscreen
          }
        }
        this.resumePhaser();
      }
    });
  }

  // ─── Phaser ──────────────────────────────────────────────────────────────────

  private enterFullscreenAndLaunch(): void {
    this.viewState = 'playing';

    setTimeout(async () => {
      const container = document.getElementById('dungeonGameContainer');
      if (container) {
        try {
          await container.requestFullscreen();
        } catch {
          // proceed without fullscreen
        }
      }
      setTimeout(() => {
        this.phaserGame = new Phaser.Game({
          type: Phaser.AUTO,
          width: 400,
          height: 250,
          physics: {
            default: 'arcade',
            arcade: { gravity: { x: 0, y: 0 }, debug: false },
          },
          scene: [Preloader, Game, GameUI],
          scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            parent: 'dungeonGameContainer',
            fullscreenTarget: 'dungeonGameContainer',
          },
          parent: 'dungeonGameContainer',
        });
      }, 100);
    }, 100);
  }

  private pausePhaser(): void {
    this.phaserGame?.scene.scenes.forEach(scene => {
      if (scene.scene.isActive()) scene.scene.pause();
    });
  }

  private resumePhaser(): void {
    this.phaserGame?.scene.scenes.forEach(scene => {
      if (scene.scene.isPaused()) scene.scene.resume();
    });
  }

  private destroyPhaser(): void {
    this.phaserGame?.destroy(true);
    this.phaserGame = undefined;
  }
}
