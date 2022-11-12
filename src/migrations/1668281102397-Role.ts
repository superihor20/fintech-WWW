import { MigrationInterface, QueryRunner } from 'typeorm';

export class Role1668281102397 implements MigrationInterface {
  name = 'Role1668281102397';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."roles_name_enum" AS ENUM('user', 'investor', 'inviter', 'admin')
        `);
    await queryRunner.query(`
            CREATE TABLE "roles" (
                "id" SERIAL NOT NULL,
                "name" "public"."roles_name_enum" NOT NULL,
                CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"),
                CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "roles"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."roles_name_enum"
        `);
  }
}
