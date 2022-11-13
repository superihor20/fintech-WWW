import { MigrationInterface, QueryRunner } from 'typeorm';

export class WalletTable1668348896949 implements MigrationInterface {
  name = 'WalletTable1668348896949';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "wallets" (
                "id" SERIAL NOT NULL,
                "amount" double precision NOT NULL DEFAULT '0',
                CONSTRAINT "PK_8402e5df5a30a229380e83e4f7e" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD "wallet_id" integer
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "UQ_67abb81dc33e75d1743323fd5db" UNIQUE ("wallet_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "FK_67abb81dc33e75d1743323fd5db" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "FK_67abb81dc33e75d1743323fd5db"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "UQ_67abb81dc33e75d1743323fd5db"
        `);
    await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "wallet_id"
        `);
    await queryRunner.query(`
            DROP TABLE "wallets"
        `);
  }
}
