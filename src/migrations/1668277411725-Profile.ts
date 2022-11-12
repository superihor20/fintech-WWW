import { MigrationInterface, QueryRunner } from 'typeorm';

export class Profile1668277411725 implements MigrationInterface {
  name = 'Profile1668277411725';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "profiles" ("id" SERIAL NOT NULL, "name" character varying, "family_name" character varying, "picture" character varying, CONSTRAINT "PK_PROFILE_ID" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "profile_id" integer`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_USER_PROFILE_ID" UNIQUE ("profile_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_PROFILE_USER_ID" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_PROFILE_USER_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_USER_PROFILE_ID"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "profile_id"`);
    await queryRunner.query(`DROP TABLE "profiles"`);
  }
}
