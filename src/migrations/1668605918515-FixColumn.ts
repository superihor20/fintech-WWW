import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixColumn1668605918515 implements MigrationInterface {
  name = 'FixColumn1668605918515';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users"
            ALTER COLUMN "invite_code" DROP NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users"
            ALTER COLUMN "invite_code"
            SET NOT NULL
        `);
  }
}
