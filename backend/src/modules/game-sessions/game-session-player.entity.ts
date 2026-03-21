import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { CharacterType, PlayerSessionStatus } from '@common/enums';
import { User } from '@modules/users/user.entity';
import { GameSession } from './game-session.entity';

@Entity('game_session_players')
@Unique(['sessionId', 'userId'])
@Index(['sessionId'])
@Index(['userId'])
export class GameSessionPlayer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'session_id' })
  sessionId!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @Column({
    name: 'character_type',
    type: 'enum',
    enum: CharacterType,
    default: CharacterType.FAUNE,
  })
  characterType!: CharacterType;

  @Column({
    type: 'enum',
    enum: PlayerSessionStatus,
    default: PlayerSessionStatus.READY,
  })
  status!: PlayerSessionStatus;

  @Column({ type: 'integer', default: 0 })
  score!: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'joined_at' })
  joinedAt!: Date;

  @ManyToOne(() => GameSession, (session) => session.players, { onDelete: 'CASCADE' })
  session?: GameSession;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user?: User;
}
