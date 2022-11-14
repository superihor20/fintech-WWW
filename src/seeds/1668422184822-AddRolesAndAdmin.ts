import { hash } from 'bcrypt';
import { MigrationInterface, QueryRunner, SelectQueryBuilder } from 'typeorm';

import { UserRoles } from '../common/enums/user-roles.enum';
import { Role, User, Wallet } from '../entities';

export class AddRolesAndAdmin1668422184822 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const queryBuilder = queryRunner.connection.createQueryBuilder();

    await this.addRoles(queryBuilder);
    await this.addAdmin(queryBuilder);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            TRUNCATE TABLE "roles"
        `);
  }

  public async addRoles(queryBuilder: SelectQueryBuilder<any>): Promise<void> {
    await queryBuilder
      .insert()
      .into(Role)
      .values(Object.values(UserRoles).map((role) => ({ name: role })))
      .execute();
  }

  public async addAdmin(queryBuilder: SelectQueryBuilder<any>): Promise<void> {
    const hashedPassword = await hash(
      process.env.ADMIN_PASSWORD || 'admin123',
      10,
    );
    const role = await queryBuilder
      .select('id')
      .from(Role, 'r')
      .where(`name='${UserRoles.ADMIN}'`)
      .getRawOne();

    const wallet = await queryBuilder
      .insert()
      .into(Wallet)
      .values([{}])
      .execute();

    await queryBuilder
      .insert()
      .into(User)
      .values([
        {
          email: process.env.ADMIN_EMAIL || 'admin@admin.com',
          password: hashedPassword,
          role: role.id,
          wallet: wallet.raw[0].id,
        },
      ])
      .execute();
  }
}
