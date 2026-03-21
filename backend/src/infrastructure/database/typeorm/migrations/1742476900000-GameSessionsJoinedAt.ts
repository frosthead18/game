import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Renames created_at → joined_at in game_session_players to match the entity.
 * The InitSchema migration created the column as created_at (via createdAtCol()),
 * but the entity uses @CreateDateColumn({ name: 'joined_at' }).
 */
export class GameSessionsJoinedAt1742476900000 implements MigrationInterface {
  name = 'GameSessionsJoinedAt1742476900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add joined_at (safe on fresh DB; already exists on manually-patched DB)
    await queryRunner.query(`
      ALTER TABLE "game_session_players"
        ADD COLUMN IF NOT EXISTS "joined_at" TIMESTAMPTZ NOT NULL DEFAULT now()
    `);

    // Backfill from created_at where joined_at is still the default
    await queryRunner.query(`
      UPDATE "game_session_players"
        SET "joined_at" = "created_at"
        WHERE "joined_at" = "created_at"
           OR "joined_at" = now()
    `);

    // Drop the old created_at — it is orphaned in the entity
    await queryRunner.query(`
      ALTER TABLE "game_session_players"
        DROP COLUMN IF EXISTS "created_at"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "game_session_players"
        ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
    `);

    await queryRunner.query(`
      UPDATE "game_session_players" SET "created_at" = "joined_at"
    `);

    await queryRunner.query(`
      ALTER TABLE "game_session_players"
        DROP COLUMN IF EXISTS "joined_at"
    `);
  }
}
