import { Injectable } from '@nestjs/common';

import { UserRoles } from '../../common/enums/user-roles.enum';
import { User } from '../../entities';
import { UserService } from '../user/user.service';

@Injectable()
export class StatisticService {
  constructor(private readonly userService: UserService) {}

  async getStatistic(): Promise<{
    numberOfAllUsers: number;
    numberOfInvestors: number;
    investors: User[];
  }> {
    const [, numberOfAllUsers] = await this.userService.findWithFilter();
    const [investors, numberOfInvestors] =
      await this.userService.findWithFilter({
        where: { role: { name: UserRoles.INVESTOR } },
      });

    return {
      numberOfAllUsers,
      numberOfInvestors,
      investors,
    };
  }
}
