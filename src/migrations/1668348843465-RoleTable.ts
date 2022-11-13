import { MigrationInterface, QueryRunner } from 'typeorm';

import { UserRoles } from '../common/enums/user-roles.enum';

export class RoleTable1668348843465 implements MigrationInterface {
  name = 'RoleTable1668348843465';

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
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "role_id" integer
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await this.addRoles(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await this.removeRoles(queryRunner);
    await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "role_id"
        `);
    await queryRunner.query(`
            DROP TABLE "roles"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."roles_name_enum"
        `);
  }

  private async addRoles(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            INSERT INTO "roles"
                ("name")
            VALUES
                ${Object.values(UserRoles).map((role) => `('${role}')`)}
        `);
  }

  private async removeRoles(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            UPDATE "users"
                "role_id" = NULL
            WHERE
                "role_id" IS NOT NULL
        `);
    await queryRunner.query(`
            TRUNCATE TABLE "roles"
    `);
  }
}
