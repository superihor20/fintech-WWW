import { hash } from 'bcrypt';
import {
  InsertResult,
  MigrationInterface,
  QueryRunner,
  SelectQueryBuilder,
} from 'typeorm';

import { rolesWeight } from '../common/constants/roles-weight.constant';
import { UserRoles } from '../common/enums/user-roles.enum';
import { getRandomNumberInRage } from '../common/helpers/get-random-number-in-range';
import { Role, User, Wallet } from '../entities';

export class AddRolesAndUsers1668422184822 implements MigrationInterface {
  queryBuilder: SelectQueryBuilder<any>;
  roleQueryBuilderSelect: SelectQueryBuilder<Role>;
  emailRounds = 8;

  public async up(queryRunner: QueryRunner): Promise<void> {
    this.queryBuilder = queryRunner.connection.createQueryBuilder();
    this.roleQueryBuilderSelect = this.queryBuilder.select('*').from(Role, 'r');

    await this.addRoles();
    await this.addAdmin();
    const roles = await this.getRolesBesideAdminAndInviter();
    await this.addRandomUsers(roles);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            TRUNCATE TABLE "roles"
        `);
  }

  public async generateInviteCode(email: string): Promise<string> {
    return hash(email, this.emailRounds);
  }

  public async addRoles(): Promise<void> {
    await this.queryBuilder
      .insert()
      .into(Role)
      .values(
        Object.values(UserRoles).map((role) => ({
          name: role,
          weight: rolesWeight[role],
        })),
      )
      .execute();
  }

  public async addWallet(amount = 0) {
    return this.queryBuilder
      .insert()
      .into(Wallet)
      .values([{ amount }])
      .execute();
  }

  public async addUsers(users: User[]) {
    this.queryBuilder.insert().into(User).values(users).execute();
  }

  public async addAdmin(): Promise<void> {
    const hashedPassword = await hash(
      process.env.ADMIN_PASSWORD || 'admin123',
      10,
    );
    const role = await this.roleQueryBuilderSelect
      .where(`name='${UserRoles.ADMIN}'`)
      .getRawOne();
    const wallet: InsertResult = await this.addWallet();
    const user = new User();
    user.email = process.env.ADMIN_EMAIL || 'admin@admin.com';
    user.inviteCode = await this.generateInviteCode(user.email);
    user.password = hashedPassword;
    user.role = role;
    user.wallet = wallet.raw[0];

    await this.addUsers([user]);
  }

  public async getRolesBesideAdminAndInviter(): Promise<Role[]> {
    const roles: Role[] = await this.roleQueryBuilderSelect
      .where(`name!='${UserRoles.ADMIN}' AND name!='${UserRoles.INVITER}'`)
      .getRawMany();

    return roles;
  }

  public async addRandomUsers(availableRoles: Role[]): Promise<void> {
    const canInvite = [UserRoles.INVESTOR, UserRoles.INVITER, UserRoles.ADMIN];
    const numberOfRandomUsers = 100;
    const minAmount = 100;
    const maxAmount = 100_000_000;
    const randomUsers: User[] = [];
    const emptyArray = Array.from(Array(numberOfRandomUsers));
    const hashedPasswords = await Promise.all(
      emptyArray.map((_, i) => hash(`randomuser${i}`, 10)),
    );
    const emails = emptyArray.map((_, i) => `user${i}@gmail.com`);
    const roles = emptyArray.map(
      () => availableRoles[getRandomNumberInRage(0, availableRoles.length - 1)],
    );
    const inviteCodes = await Promise.all(
      emails.map((email, i) =>
        canInvite.includes(roles[i].name)
          ? this.generateInviteCode(email)
          : null,
      ),
    );

    for (let i = 0; i < numberOfRandomUsers; i++) {
      const user = new User();
      user.email = emails[i];
      user.password = hashedPasswords[i];
      user.inviteCode = inviteCodes[i];
      user.role = roles[i];
      user.wallet = (
        await this.addWallet(
          user.role.name === UserRoles.INVESTOR
            ? getRandomNumberInRage(minAmount, maxAmount)
            : 0,
        )
      ).raw[0];

      randomUsers.push(user);
    }

    await this.addUsers(randomUsers);
  }
}
