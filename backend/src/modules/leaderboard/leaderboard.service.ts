import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { LeaderboardScore } from './leaderboard-score.entity';
import { LeaderboardEntryDto, LeaderboardQueryDto, SubmitScoreDto } from './leaderboard.dto';

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectPinoLogger(LeaderboardService.name) private readonly logger: PinoLogger,
    @InjectRepository(LeaderboardScore)
    private readonly scoresRepo: Repository<LeaderboardScore>,
  ) {}

  async submitScore(userId: string, dto: SubmitScoreDto): Promise<void> {
    const score = this.scoresRepo.create({
      userId,
      gameType: dto.gameType,
      score: dto.score,
      level: dto.level ?? 1,
    });

    await this.scoresRepo.save(score);
    this.logger.info({ userId, score: dto.score, gameType: dto.gameType }, 'Score submitted');
  }

  async getLeaderboard(query: LeaderboardQueryDto): Promise<LeaderboardEntryDto[]> {
    const qb = this.scoresRepo
      .createQueryBuilder('s')
      .innerJoin('s.user', 'u')
      .select([
        's.id',
        's.user_id',
        'u.username',
        's.score',
        's.level',
        's.game_type',
        's.played_at',
      ])
      .orderBy('s.score', 'DESC')
      .limit(query.limit);

    if (query.gameType) {
      qb.where('s.game_type = :gameType', { gameType: query.gameType });
    }

    const scores = await qb.getRawMany<{
      s_id: string;
      s_user_id: string;
      u_username: string;
      s_score: number;
      s_level: number;
      s_game_type: string;
      s_played_at: Date;
    }>();

    return scores.map((row, index) => ({
      rank: index + 1,
      userId: row.s_user_id,
      username: row.u_username,
      score: row.s_score,
      level: row.s_level,
      gameType: row.s_game_type as LeaderboardEntryDto['gameType'],
      playedAt: row.s_played_at,
    }));
  }
}
