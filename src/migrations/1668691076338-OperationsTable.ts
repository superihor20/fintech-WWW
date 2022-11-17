import { MigrationInterface, QueryRunner } from 'typeorm';

export class OperationsTable1668691076338 implements MigrationInterface {
  name = 'OperationsTable1668691076338';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "public"."operations_operation_type_enum" AS ENUM(
                'deposite',
                'withdraw',
                'daily increase',
                'inviter bonus'
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "operations" (
                "id" SERIAL NOT NULL,
                "operation_type" "public"."operations_operation_type_enum" NOT NULL,
                "earnings" double precision NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "user_id" integer,
                CONSTRAINT "PK_7b62d84d6f9912b975987165856" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "operations"
            ADD CONSTRAINT "FK_140d3d8fe7db297a0ca81ca7949" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "operations" DROP CONSTRAINT "FK_140d3d8fe7db297a0ca81ca7949"
        `);
    await queryRunner.query(`
            DROP TABLE "operations"
        `);
    await queryRunner.query(`
            DROP TYPE "public"."operations_operation_type_enum"
        `);
  }
}
