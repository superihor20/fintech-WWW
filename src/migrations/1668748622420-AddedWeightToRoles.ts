import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedWeightToRoles1668748622420 implements MigrationInterface {
  name = 'AddedWeightToRoles1668748622420';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "roles"
            ADD "weight" integer NOT NULL DEFAULT '0'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "roles" DROP COLUMN "weight"
        `);
  }
}
