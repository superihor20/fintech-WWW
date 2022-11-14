import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserRoles } from '../../common/enums/user-roles.enum';
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
    totalAmount: number;
    investors: User[];
  }> {
    const [, numberOfAllUsers] = await this.userService.findWithFilter();
    const [investors, numberOfInvestors] =
      await this.userService.findWithFilter({
        where: { role: { name: UserRoles.INVESTOR } },
      });
    const { totalAmount } = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.wallet', 'wallets')
      .select('SUM(wallets.amount)', 'totalAmount')
      .getRawOne();

    console.log(totalAmount);

    return {
      numberOfAllUsers,
      numberOfInvestors,
      totalAmount,
      investors,
    };
  }
}
