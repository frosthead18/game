import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';
import {
  boolCol,
  createdAtCol,
  enumCol,
  intCol,
  uuidCol,
  uuidPrimaryCol,
  updatedAtCol,
  varcharCol,
  fkConstraint,
  timestamptzCol,
} from '../migration-helper';

export class InitSchema1710000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "user_role_enum" AS ENUM('admin', 'player')`);
    await queryRunner.query(
      `CREATE TYPE "game_type_enum" AS ENUM('dungeon', 'battle_armour', 'planes')`,
    );
    await queryRunner.query(
      `CREATE TYPE "session_status_enum" AS ENUM('waiting', 'in_progress', 'finished')`,
    );
    await queryRunner.query(
      `CREATE TYPE "player_session_status_enum" AS ENUM('ready', 'playing', 'dead', 'left')`,
    );
    await queryRunner.query(
      `CREATE TYPE "character_type_enum" AS ENUM('faune', 'swordsman')`,
    );

    // users
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          uuidPrimaryCol(),
          varcharCol('username', '50'),
          varcharCol('email', '255'),
          varcharCol('password_hash', '255'),
          enumCol('role', ['admin', 'player'], 'player'),
          createdAtCol(),
          updatedAtCol(),
        ],
        uniques: [
          { name: 'UQ_users_username', columnNames: ['username'] },
          { name: 'UQ_users_email', columnNames: ['email'] },
        ],
      }),
      true,
    );

    await queryRunner.createIndices('users', [
      new TableIndex({ name: 'IDX_users_username', columnNames: ['username'] }),
      new TableIndex({ name: 'IDX_users_email', columnNames: ['email'] }),
    ]);

    // refresh_tokens
    await queryRunner.createTable(
      new Table({
        name: 'refresh_tokens',
        columns: [
          uuidPrimaryCol(),
          uuidCol('user_id'),
          varcharCol('token_hash', '500'),
          timestamptzCol('expires_at'),
          createdAtCol(),
        ],
        foreignKeys: [fkConstraint(['user_id'], 'users', ['id'], 'CASCADE')],
      }),
      true,
    );

    await queryRunner.createIndex(
      'refresh_tokens',
      new TableIndex({ name: 'IDX_refresh_tokens_user_id', columnNames: ['user_id'] }),
    );

    // game_sessions
    await queryRunner.createTable(
      new Table({
        name: 'game_sessions',
        columns: [
          uuidPrimaryCol(),
          uuidCol('host_user_id'),
          varcharCol('name', '100'),
          enumCol('game_type', ['dungeon', 'battle_armour', 'planes']),
          enumCol('status', ['waiting', 'in_progress', 'finished'], 'waiting'),
          { ...intCol('max_players'), type: 'smallint', default: 4 },
          createdAtCol(),
          updatedAtCol(),
        ],
        foreignKeys: [fkConstraint(['host_user_id'], 'users', ['id'], 'CASCADE')],
      }),
      true,
    );

    await queryRunner.createIndices('game_sessions', [
      new TableIndex({ name: 'IDX_game_sessions_status', columnNames: ['status'] }),
      new TableIndex({ name: 'IDX_game_sessions_game_type', columnNames: ['game_type'] }),
    ]);

    // game_session_players
    await queryRunner.createTable(
      new Table({
        name: 'game_session_players',
        columns: [
          uuidPrimaryCol(),
          uuidCol('session_id'),
          uuidCol('user_id'),
          enumCol('character_type', ['faune', 'swordsman'], 'faune'),
          enumCol('status', ['ready', 'playing', 'dead', 'left'], 'ready'),
          intCol('score'),
          createdAtCol(),
        ],
        uniques: [
          {
            name: 'UQ_game_session_players_session_id_user_id',
            columnNames: ['session_id', 'user_id'],
          },
        ],
        foreignKeys: [
          fkConstraint(['session_id'], 'game_sessions', ['id'], 'CASCADE'),
          fkConstraint(['user_id'], 'users', ['id'], 'CASCADE'),
        ],
      }),
      true,
    );

    await queryRunner.createIndices('game_session_players', [
      new TableIndex({
        name: 'IDX_game_session_players_session_id',
        columnNames: ['session_id'],
      }),
      new TableIndex({ name: 'IDX_game_session_players_user_id', columnNames: ['user_id'] }),
    ]);

    // leaderboard_scores
    await queryRunner.createTable(
      new Table({
        name: 'leaderboard_scores',
        columns: [
          uuidPrimaryCol(),
          uuidCol('user_id'),
          enumCol('game_type', ['dungeon', 'battle_armour', 'planes']),
          intCol('score'),
          { ...intCol('level'), default: 1 },
          { ...createdAtCol(), name: 'played_at' },
        ],
        foreignKeys: [fkConstraint(['user_id'], 'users', ['id'], 'CASCADE')],
      }),
      true,
    );

    await queryRunner.createIndices('leaderboard_scores', [
      new TableIndex({
        name: 'IDX_leaderboard_scores_game_type_score',
        columnNames: ['game_type', 'score'],
      }),
      new TableIndex({ name: 'IDX_leaderboard_scores_user_id', columnNames: ['user_id'] }),
    ]);

    void boolCol;
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('leaderboard_scores', true);
    await queryRunner.dropTable('game_session_players', true);
    await queryRunner.dropTable('game_sessions', true);
    await queryRunner.dropTable('refresh_tokens', true);
    await queryRunner.dropTable('users', true);

    await queryRunner.query(`DROP TYPE IF EXISTS "character_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "player_session_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "session_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "game_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_role_enum"`);
  }
}
