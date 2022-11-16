import { MigrationInterface, QueryRunner } from "typeorm";

export class OperationTable1668615466142 implements MigrationInterface {
    name = 'OperationTable1668615466142'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "operations" (
                "id" SERIAL NOT NULL,
                "operation_type" "public"."operations_operation_type_enum" NOT NULL,
                "amount" integer NOT NULL,
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
    }

}
