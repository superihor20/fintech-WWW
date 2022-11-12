import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePermissionNameField1668285166283
  implements MigrationInterface
{
  name = 'UpdatePermissionNameField1668285166283';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "permissions" DROP CONSTRAINT "UQ_48ce552495d14eae9b187bb6716"
        `);
    await queryRunner.query(`
            ALTER TABLE "permissions" DROP COLUMN "name"
        `);
    await queryRunner.query(`
            CREATE TYPE "public"."permissions_name_enum" AS ENUM('invest', 'invite friends', 'withdraw')
        `);
    await queryRunner.query(`
            ALTER TABLE "permissions"
            ADD "name" "public"."permissions_name_enum" NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "permissions"
            ADD CONSTRAINT "UQ_48ce552495d14eae9b187bb6716" UNIQUE ("name")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "permissions" DROP CONSTRAINT "UQ_48ce552495d14eae9b187bb6716"
        `);
    await queryRunner.query(`
            ALTER TABLE "permissions" DROP COLUMN "name"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."permissions_name_enum"
        `);
    await queryRunner.query(`
            ALTER TABLE "permissions"
            ADD "name" character varying NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE "permissions"
            ADD CONSTRAINT "UQ_48ce552495d14eae9b187bb6716" UNIQUE ("name")
        `);
  }
}
