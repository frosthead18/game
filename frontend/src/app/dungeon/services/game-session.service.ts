import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/auth.service';

export interface SessionPlayer {
  userId: string;
  username: string;
  characterType: string;
  status: string;
  score: number;
}

export interface GameSessionDto {
  id: string;
  hostUserId: string;
  name: string;
  gameType: string;
  status: string;
  maxPlayers: number;
  playerCount: number;
  players: SessionPlayer[];
  createdAt: string;
  hostEmail?: string;
}

export interface PlayerEvent {
  userId: string;
  username: string;
}

@Injectable()
export class GameSessionService implements OnDestroy {
  private readonly apiBase = environment.apiUrl;
  private socket?: Socket;

  /** Cognito sub decoded from the access token — available after connectSocket() */
  currentUserId = '';

  private readonly sessionState$ = new BehaviorSubject<GameSessionDto | null>(null);
  private readonly playerJoined$ = new Subject<PlayerEvent>();
  private readonly playerLeft$ = new Subject<PlayerEvent>();
  private readonly sessionStarted$ = new Subject<GameSessionDto>();

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  get sessionState(): Observable<GameSessionDto | null> {
    return this.sessionState$.asObservable();
  }

  get playerJoined(): Observable<PlayerEvent> {
    return this.playerJoined$.asObservable();
  }

  get playerLeft(): Observable<PlayerEvent> {
    return this.playerLeft$.asObservable();
  }

  get sessionStarted(): Observable<GameSessionDto> {
    return this.sessionStarted$.asObservable();
  }

  listSessions(gameType = 'dungeon'): Observable<GameSessionDto[]> {
    return this.http.get<GameSessionDto[]>(`${this.apiBase}/game-sessions`, {
      params: { gameType },
    });
  }

  createSession(name: string): Observable<GameSessionDto> {
    return this.http.post<GameSessionDto>(`${this.apiBase}/game-sessions`, {
      name,
      gameType: 'dungeon',
      maxPlayers: 4,
    });
  }

  joinSession(sessionId: string): Observable<GameSessionDto> {
    return this.http.post<GameSessionDto>(
      `${this.apiBase}/game-sessions/${sessionId}/join`,
      {},
    );
  }

  leaveSession(sessionId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/game-sessions/${sessionId}/leave`);
  }

  async connectSocket(): Promise<void> {
    const token = await this.authService.getAccessToken();
    if (!token) {
      throw new Error('No auth token available');
    }

    // Decode Cognito sub from the JWT payload (no library needed — base64 decode)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.currentUserId = payload.sub ?? '';
    } catch {
      this.currentUserId = '';
    }

    // Derive WS base URL from apiUrl (strip /api/v1 path)
    const wsBase = this.apiBase.replace(/\/api\/v1.*$/, '');

    this.socket = io(`${wsBase}/game`, {
      auth: { token },
      // websocket-only keeps AWS ALB compatibility (no polling upgrade handshake)
      transports: ['websocket'],
    });

    this.socket.on('session-state', (data: GameSessionDto) => {
      this.sessionState$.next(data);
    });

    this.socket.on('player-joined', (data: PlayerEvent) => {
      this.playerJoined$.next(data);
    });

    this.socket.on('player-left', (data: PlayerEvent) => {
      this.playerLeft$.next(data);
    });

    this.socket.on('session-started', (data: GameSessionDto) => {
      this.sessionState$.next(data);
      this.sessionStarted$.next(data);
    });

    return new Promise((resolve, reject) => {
      this.socket!.on('connect', () => resolve());
      this.socket!.on('connect_error', (err) => reject(err));
    });
  }

  joinSessionRoom(sessionId: string): void {
    this.socket?.emit('join-session', { sessionId });
  }

  startSession(sessionId: string): void {
    this.socket?.emit('start-session', { sessionId });
  }

  leaveSessionRoom(sessionId: string): void {
    this.socket?.emit('leave-session', { sessionId });
  }

  disconnectSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = undefined;
    }
    this.sessionState$.next(null);
  }

  ngOnDestroy(): void {
    this.disconnectSocket();
  }
}
