import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GameType, SessionStatus } from '@common/enums';
import { User } from '@modules/users/user.entity';
import { GameSessionPlayer } from './game-session-player.entity';

@Entity('game_sessions')
@Index(['status'])
@Index(['gameType'])
export class GameSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'host_user_id' })
  hostUserId!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ name: 'game_type', type: 'enum', enum: GameType })
  gameType!: GameType;

  @Column({ type: 'enum', enum: SessionStatus, default: SessionStatus.WAITING })
  status!: SessionStatus;

  @Column({ name: 'max_players', type: 'smallint', default: 4 })
  maxPlayers!: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  host?: User;

  @OneToMany(() => GameSessionPlayer, (player) => player.session, { cascade: true })
  players?: GameSessionPlayer[];
}
