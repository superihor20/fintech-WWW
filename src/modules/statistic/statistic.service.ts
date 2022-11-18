import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserRoles } from '../../common/enums/user-roles.enum';
import { InvitersInfo } from '../../common/types/inviters-info.type';
import { User } from '../../entities';
import { UserService } from '../user/user.service';

@Injectable()
export class StatisticService {
  constructor(
    private readonly userService: UserService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private async countNumberOfAllUsersAndByRoles() {
    return this.userRepository
      .createQueryBuilder('u')
      .leftJoin('u.role', 'r')
      .select('COUNT(u.*)', 'numberOfAllUsers')
      .addSelect(
        `SUM(CASE WHEN r.name = '${UserRoles.INVESTOR}' OR r.name = '${UserRoles.INVITER}' THEN 1 ELSE 0 END)`,
        'numberOfInvestors',
      )
      .addSelect(
        'SUM(CASE WHEN u.invited_by IS NOT NULL THEN 1 ELSE 0 END)',
        'numberOfInvitedUsers',
      )
      .addSelect(
        `SUM(CASE WHEN r.name = '${UserRoles.INVITER}' THEN 1 ELSE 0 END)`,
        'numberOfInviters',
      )
      .addSelect(
        `SUM(CASE WHEN r.name = '${UserRoles.ADMIN}' THEN 1 ELSE 0 END)`,
        'numberOfAdmins',
      )
      .getRawOne();
  }

  private async getInvestorsInfo(): Promise<User[]> {
    const [investors] = await this.userService.findWithFilter({
      where: [
        { role: { name: UserRoles.INVESTOR } },
        { role: { name: UserRoles.INVITER } },
      ],
      order: { wallet: { amount: 'DESC' } },
    });

    return investors;
  }

  private async getInvitersInfo(): Promise<InvitersInfo[]> {
    return this.userRepository.query(
      `
        SELECT 
          COUNT(u.invited_by) AS numberOfInvitedUsers,
          (SELECT u1.email FROM users AS u1 WHERE u.invited_by=u1.id)
        FROM
         users AS u 
        WHERE
         u.invited_by IS NOT NULL
        GROUP BY 
          u.invited_by
        ORDER BY
          numberOfInvitedUsers DESC
      `,
    );
  }

  private async countTotalAmountBesideAdmin(): Promise<number> {
    const { totalAmount } = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.wallet', 'wallets')
      .leftJoin('user.role', 'roles')
      .select('SUM(wallets.amount)', 'totalAmount')
      .where(`roles.name != :adminRole`, { adminRole: UserRoles.ADMIN })
      .getRawOne();

    return totalAmount;
  }

  private async getAdminsInfo(): Promise<User[]> {
    const [admins] = await this.userService.findWithFilter({
      where: [{ role: { name: UserRoles.ADMIN } }],
      order: { wallet: { amount: 'DESC' } },
    });

    return admins;
  }

  async getStatistic(): Promise<{
    numberOfAllUsers: number;
    numberOfInvestors: number;
    numberOfInviters: number;
    numberOfInvitedUsers: number;
    numberOfAdmins: number;
    totalAmount: number;
    investors: User[];
    admins: User[];
    invitersInfo: InvitersInfo[];
  }> {
    const countResult = await this.countNumberOfAllUsersAndByRoles();
    const investors = await this.getInvestorsInfo();
    const invitersInfo = await this.getInvitersInfo();
    const totalAmount = await this.countTotalAmountBesideAdmin();
    const admins = await this.getAdminsInfo();

    return {
      ...countResult,
      totalAmount,
      investors,
      invitersInfo,
      admins,
    };
  }
}
