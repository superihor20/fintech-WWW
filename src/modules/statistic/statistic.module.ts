import { Module } from '@nestjs/common';

import { UserModule } from '../user/user.module';

import { StatisticController } from './statistic.controller';
import { StatisticService } from './statistic.service';

@Module({
  imports: [UserModule],
  controllers: [StatisticController],
  providers: [StatisticService],
})
export class StatisticModule {}
