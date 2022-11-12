import { MigrationInterface, QueryRunner } from 'typeorm';

export class Permission1668281559335 implements MigrationInterface {
  name = 'Permission1668281559335';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "permissions" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                CONSTRAINT "UQ_48ce552495d14eae9b187bb6716" UNIQUE ("name"),
                CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "permissions"
        `);
  }
}
