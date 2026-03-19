import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { GameSessionsService } from './game-sessions.service';
import { WsJwtGuard, AuthenticatedSocket } from './ws-jwt.guard';

interface PlayerMovePayload {
  sessionId: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  direction: string;
}

interface PlayerActionPayload {
  sessionId: string;
  actionType: 'attack' | 'item_pickup' | 'death';
  targetId?: string;
  data?: Record<string, unknown>;
}

interface SessionStateRequest {
  sessionId: string;
}

@WebSocketGateway({ namespace: '/game', cors: { origin: '*', credentials: true } })
export class GameSessionsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly socketSessionMap = new Map<string, string>();

  constructor(
    @InjectPinoLogger(GameSessionsGateway.name) private readonly logger: PinoLogger,
    private readonly sessionsService: GameSessionsService,
  ) {}

  handleConnection(client: Socket): void {
    this.logger.info({ socketId: client.id }, 'WebSocket client connected');
  }

  async handleDisconnect(client: Socket): Promise<void> {
    const sessionId = this.socketSessionMap.get(client.id);
    const authed = client as AuthenticatedSocket;

    if (sessionId && authed.userId) {
      try {
        await this.sessionsService.leaveSession(sessionId, authed.userId);
        client.to(sessionId).emit('player-left', {
          userId: authed.userId,
          username: authed.username,
        });
        this.server.to(sessionId).emit('session-state', await this.sessionsService.getSession(sessionId).catch(() => null));
      } catch {
        // Session may already be cleaned up
      }
      this.socketSessionMap.delete(client.id);
    }

    this.logger.info({ socketId: client.id }, 'WebSocket client disconnected');
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join-session')
  async handleJoinSession(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { sessionId: string; characterType?: string },
  ): Promise<void> {
    const { sessionId } = payload;

    const existingSession = this.socketSessionMap.get(client.id);
    if (existingSession && existingSession !== sessionId) {
      throw new WsException('Already in a different session');
    }

    await client.join(sessionId);
    this.socketSessionMap.set(client.id, sessionId);

    const session = await this.sessionsService.getSession(sessionId);
    this.server.to(sessionId).emit('player-joined', {
      userId: client.userId,
      username: client.username,
    });
    client.emit('session-state', session);

    this.logger.info({ sessionId, userId: client.userId }, 'Player joined session room');
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('leave-session')
  async handleLeaveSession(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: SessionStateRequest,
  ): Promise<void> {
    const { sessionId } = payload;

    await this.sessionsService.leaveSession(sessionId, client.userId);
    await client.leave(sessionId);
    this.socketSessionMap.delete(client.id);

    client.to(sessionId).emit('player-left', {
      userId: client.userId,
      username: client.username,
    });

    this.logger.info({ sessionId, userId: client.userId }, 'Player left session room');
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('player-ready')
  async handlePlayerReady(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: SessionStateRequest,
  ): Promise<void> {
    const { sessionId } = payload;

    this.server.to(sessionId).emit('player-ready', {
      userId: client.userId,
      username: client.username,
    });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('start-session')
  async handleStartSession(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: SessionStateRequest,
  ): Promise<void> {
    const { sessionId } = payload;

    await this.sessionsService.startSession(sessionId, client.userId);
    const session = await this.sessionsService.getSession(sessionId);

    this.server.to(sessionId).emit('session-started', session);
    this.logger.info({ sessionId, userId: client.userId }, 'Session started');
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('player-move')
  handlePlayerMove(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: PlayerMovePayload,
  ): void {
    const { sessionId, ...moveData } = payload;

    client.to(sessionId).emit('player-moved', {
      userId: client.userId,
      ...moveData,
      timestamp: Date.now(),
    });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('player-action')
  handlePlayerAction(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: PlayerActionPayload,
  ): void {
    const { sessionId, ...actionData } = payload;

    this.server.to(sessionId).emit('player-action', {
      userId: client.userId,
      ...actionData,
      timestamp: Date.now(),
    });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('session-state')
  async handleSessionStateRequest(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: SessionStateRequest,
  ): Promise<void> {
    const session = await this.sessionsService.getSession(payload.sessionId);
    client.emit('session-state', session);
  }
}
