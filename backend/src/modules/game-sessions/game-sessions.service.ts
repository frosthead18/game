import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { CharacterType, PlayerSessionStatus, SessionStatus } from '@common/enums';
import { GameSession } from './game-session.entity';
import { GameSessionPlayer } from './game-session-player.entity';
import { CreateSessionDto, GameSessionDto, JoinSessionDto } from './game-sessions.dto';

@Injectable()
export class GameSessionsService {
  constructor(
    @InjectPinoLogger(GameSessionsService.name) private readonly logger: PinoLogger,
    @InjectRepository(GameSession) private readonly sessionsRepo: Repository<GameSession>,
    @InjectRepository(GameSessionPlayer)
    private readonly playersRepo: Repository<GameSessionPlayer>,
  ) {}

  async listSessions(): Promise<GameSessionDto[]> {
    const sessions = await this.sessionsRepo.find({
      where: { status: SessionStatus.WAITING },
      relations: ['players', 'players.user'],
      order: { createdAt: 'DESC' },
    });

    return sessions.map((s) => this.toDto(s));
  }

  async createSession(userId: string, dto: CreateSessionDto): Promise<GameSessionDto> {
    const session = this.sessionsRepo.create({
      hostUserId: userId,
      name: dto.name,
      gameType: dto.gameType,
      maxPlayers: dto.maxPlayers ?? 4,
    });

    await this.sessionsRepo.save(session);

    const hostPlayer = this.playersRepo.create({
      sessionId: session.id,
      userId,
      characterType: CharacterType.FAUNE,
      status: PlayerSessionStatus.READY,
    });
    await this.playersRepo.save(hostPlayer);

    this.logger.info({ sessionId: session.id, userId }, 'Game session created');
    return this.getSession(session.id);
  }

  async joinSession(sessionId: string, userId: string, dto: JoinSessionDto): Promise<GameSessionDto> {
    const session = await this.sessionsRepo.findOne({
      where: { id: sessionId },
      relations: ['players'],
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.status !== SessionStatus.WAITING) {
      throw new BadRequestException('Session is not accepting players');
    }

    const activePlayers = session.players?.filter((p) => p.status !== PlayerSessionStatus.LEFT) ?? [];

    if (activePlayers.length >= session.maxPlayers) {
      throw new BadRequestException('Session is full');
    }

    const alreadyJoined = activePlayers.find((p) => p.userId === userId);
    if (alreadyJoined) {
      throw new BadRequestException('Already in this session');
    }

    const player = this.playersRepo.create({
      sessionId,
      userId,
      characterType: dto.characterType ?? CharacterType.FAUNE,
      status: PlayerSessionStatus.READY,
    });

    await this.playersRepo.save(player);
    this.logger.info({ sessionId, userId }, 'Player joined session');

    return this.getSession(sessionId);
  }

  async leaveSession(sessionId: string, userId: string): Promise<void> {
    const player = await this.playersRepo.findOne({ where: { sessionId, userId } });

    if (!player) {
      throw new NotFoundException('Not a member of this session');
    }

    await this.playersRepo.update(player.id, { status: PlayerSessionStatus.LEFT });

    const session = await this.sessionsRepo.findOne({
      where: { id: sessionId },
      relations: ['players'],
    });

    if (!session) return;

    const remainingActive = session.players?.filter(
      (p) => p.status !== PlayerSessionStatus.LEFT && p.userId !== userId,
    ) ?? [];

    if (remainingActive.length === 0) {
      await this.sessionsRepo.delete(sessionId);
      this.logger.info({ sessionId }, 'Empty session deleted');
      return;
    }

    if (session.hostUserId === userId) {
      await this.sessionsRepo.update(sessionId, { hostUserId: remainingActive[0]!.userId });
    }

    this.logger.info({ sessionId, userId }, 'Player left session');
  }

  async getSession(sessionId: string): Promise<GameSessionDto> {
    const session = await this.sessionsRepo.findOne({
      where: { id: sessionId },
      relations: ['players', 'players.user'],
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return this.toDto(session);
  }

  async startSession(sessionId: string, userId: string): Promise<void> {
    const session = await this.sessionsRepo.findOneOrFail({ where: { id: sessionId } });

    if (session.hostUserId !== userId) {
      throw new ForbiddenException('Only the host can start the session');
    }

    if (session.status !== SessionStatus.WAITING) {
      throw new BadRequestException('Session is not in waiting state');
    }

    await this.sessionsRepo.update(sessionId, { status: SessionStatus.IN_PROGRESS });
    await this.playersRepo.update(
      { sessionId },
      { status: PlayerSessionStatus.PLAYING },
    );
  }

  async finishSession(sessionId: string): Promise<void> {
    await this.sessionsRepo.update(sessionId, { status: SessionStatus.FINISHED });
  }

  private toDto(session: GameSession): GameSessionDto {
    const activePlayers = session.players?.filter((p) => p.status !== PlayerSessionStatus.LEFT) ?? [];

    return {
      id: session.id,
      hostUserId: session.hostUserId,
      name: session.name,
      gameType: session.gameType,
      status: session.status,
      maxPlayers: session.maxPlayers,
      playerCount: activePlayers.length,
      createdAt: session.createdAt,
      players: activePlayers.map((p) => ({
        userId: p.userId,
        username: p.user?.username ?? '',
        characterType: p.characterType,
        status: p.status,
        score: p.score,
      })),
    };
  }
}
