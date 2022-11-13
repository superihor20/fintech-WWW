import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateRole1668343465023 implements MigrationInterface {
  name = 'UpdateRole1668343465023';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "UQ_a2cecd1a3531c0b041e29ba46e1"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "role_id"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "role_id" integer
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "UQ_a2cecd1a3531c0b041e29ba46e1" UNIQUE ("role_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
