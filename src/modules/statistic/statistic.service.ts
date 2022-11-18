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

  async getStatistic(): Promise<{
    numberOfAllUsers: number;
    numberOfInvestors: number;
    numberOfInviters: number;
    numberOfInvitedUsers: number;
    totalAmount: number;
    investors: User[];
    invitersInfo: InvitersInfo;
  }> {
    const [, numberOfAllUsers] = await this.userService.findWithFilter({
      where: { role: { name: Not(UserRoles.ADMIN) } },
    });
    const [investors, numberOfInvestors] =
      await this.userService.findWithFilter({
        where: [
          { role: { name: UserRoles.INVESTOR } },
          { role: { name: UserRoles.INVITER } },
        ],
        order: { wallet: { amount: 'DESC' } },
      });
    const [, numberOfInvitedUsers] = await this.userService.findWithFilter({
      where: { invitedBy: Not(IsNull()) },
    });
    const invitersInfo: InvitersInfo = await this.userRepository.query(
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
    const { totalAmount } = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.wallet', 'wallets')
      .leftJoin('user.role', 'roles')
      .select('SUM(wallets.amount)', 'totalAmount')
      .where(`roles.name != '${UserRoles.ADMIN}'`)
      .getRawOne();

    return {
      numberOfAllUsers,
      numberOfInvestors,
      numberOfInviters: invitersInfo.length,
      numberOfInvitedUsers,
      totalAmount,
      investors,
      invitersInfo,
    };
  }
}
