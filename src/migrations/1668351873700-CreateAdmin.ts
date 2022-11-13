import { hash } from 'bcrypt';
import { MigrationInterface, QueryRunner } from 'typeorm';

import { Profile, Role, User, Wallet } from '../entities';

export class CreateAdmin1668351873700 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hashedPassword = await hash('123123123', 10);
    const queryBuilder = queryRunner.connection.createQueryBuilder();
    const role = await queryBuilder
      .select('id')
      .from(Role, 'r')
      .where(`name='admin'`)
      .getRawOne();

    const profile = await queryBuilder
      .insert()
      .into(Profile)
      .values([{}])
      .execute();

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
          email: 'super@admin.com',
          password: hashedPassword,
          role: role.id,
          profile: profile.raw[0].id,
          wallet: wallet.raw[0].id,
        },
      ])
      .execute();
  }

  public async down(): Promise<void> {
    console.info('Not implemented');
  }
}
