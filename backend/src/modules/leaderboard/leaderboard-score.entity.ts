import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GameType } from '@common/enums';
import { User } from '@modules/users/user.entity';

@Entity('leaderboard_scores')
@Index(['gameType', 'score'])
@Index(['userId'])
export class LeaderboardScore {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @Column({ name: 'game_type', type: 'enum', enum: GameType })
  gameType!: GameType;

  @Column({ type: 'integer' })
  score!: number;

  @Column({ type: 'integer', default: 1 })
  level!: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'played_at' })
  playedAt!: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user?: User;
}
