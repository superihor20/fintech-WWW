import { hash } from 'bcrypt';
import { MigrationInterface, QueryRunner, SelectQueryBuilder } from 'typeorm';

import { UserRoles } from '../common/enums/user-roles.enum';
import { Role, User, Wallet } from '../entities';

export class AddRolesAndUsers1668422184822 implements MigrationInterface {
  queryBuilder: SelectQueryBuilder<any>;

  public async up(queryRunner: QueryRunner): Promise<void> {
    this.queryBuilder = queryRunner.connection.createQueryBuilder();

    await this.addRoles();
    await this.addAdmin();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            TRUNCATE TABLE "roles"
        `);
  }

  public async addRoles(): Promise<void> {
    await this.queryBuilder
      .insert()
      .into(Role)
      .values(Object.values(UserRoles).map((role) => ({ name: role })))
      .execute();
  }

  public async addAdmin(): Promise<void> {
    const hashedPassword = await hash(
      process.env.ADMIN_PASSWORD || 'admin123',
      10,
    );
    const role = await this.queryBuilder
      .select('id')
      .from(Role, 'r')
      .where(`name='${UserRoles.ADMIN}'`)
      .getRawOne();

    const wallet = await this.queryBuilder
      .insert()
      .into(Wallet)
      .values([{}])
      .execute();

    await this.queryBuilder
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
