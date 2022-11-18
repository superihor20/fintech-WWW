import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';

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

  private async countNumberOfAllUsers(): Promise<number> {
    const [, numberOfAllUsers] = await this.userService.findWithFilter({
      where: { role: { name: Not(UserRoles.ADMIN) } },
    });

    return numberOfAllUsers;
  }

  private async getInvestorsInfo(): Promise<{
    investors: User[];
    numberOfInvestors: number;
  }> {
    const [investors, numberOfInvestors] =
      await this.userService.findWithFilter({
        where: [
          { role: { name: UserRoles.INVESTOR } },
          { role: { name: UserRoles.INVITER } },
        ],
        order: { wallet: { amount: 'DESC' } },
      });

    return {
      investors,
      numberOfInvestors,
    };
  }

  private async getInvitersInfo(): Promise<{
    numberOfInvitedUsers: number;
    invitersInfo: InvitersInfo[];
  }> {
    const [, numberOfInvitedUsers] = await this.userService.findWithFilter({
      where: { invitedBy: Not(IsNull()) },
    });
    const invitersInfo: InvitersInfo[] = await this.userRepository.query(
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

    return {
      numberOfInvitedUsers,
      invitersInfo,
    };
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

  private async getAdminsInfo(): Promise<{
    admins: User[];
    numberOfAdmins: number;
  }> {
    const [admins, numberOfAdmins] = await this.userService.findWithFilter({
      where: [{ role: { name: UserRoles.ADMIN } }],
      order: { wallet: { amount: 'DESC' } },
    });

    return {
      admins,
      numberOfAdmins,
    };
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
    const numberOfAllUsers = await this.countNumberOfAllUsers();
    const { investors, numberOfInvestors } = await this.getInvestorsInfo();
    const { invitersInfo, numberOfInvitedUsers } = await this.getInvitersInfo();
    const totalAmount = await this.countTotalAmountBesideAdmin();
    const { numberOfAdmins, admins } = await this.getAdminsInfo();

    return {
      numberOfAllUsers,
      numberOfInvestors,
      numberOfInviters: invitersInfo.length,
      numberOfInvitedUsers,
      numberOfAdmins,
      totalAmount,
      investors,
      invitersInfo,
      admins,
    };
  }
}
