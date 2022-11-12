import { MigrationInterface, QueryRunner } from 'typeorm';

export class RoleToPermissionRelations1668282834523
  implements MigrationInterface
{
  name = 'RoleToPermissionRelations1668282834523';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "role_to_permission" (
                "role_id" integer NOT NULL,
                "permission_id" integer NOT NULL,
                CONSTRAINT "PK_ac8e72c29abc2d6c4cf590856c9" PRIMARY KEY ("role_id", "permission_id")
            )
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_ac652a18fe944c79c5a9e87c8f" ON "role_to_permission" ("role_id")
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_9dc2c10538df147048ce967258" ON "role_to_permission" ("permission_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "role_to_permission"
            ADD CONSTRAINT "FK_ac652a18fe944c79c5a9e87c8ff" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    await queryRunner.query(`
            ALTER TABLE "role_to_permission"
            ADD CONSTRAINT "FK_9dc2c10538df147048ce9672589" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "role_to_permission" DROP CONSTRAINT "FK_9dc2c10538df147048ce9672589"
        `);
    await queryRunner.query(`
            ALTER TABLE "role_to_permission" DROP CONSTRAINT "FK_ac652a18fe944c79c5a9e87c8ff"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_9dc2c10538df147048ce967258"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."IDX_ac652a18fe944c79c5a9e87c8f"
        `);
    await queryRunner.query(`
            DROP TABLE "role_to_permission"
        `);
  }
}
