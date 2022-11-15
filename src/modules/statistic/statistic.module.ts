import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../../entities';
import { UserModule } from '../user/user.module';

import { StatisticController } from './statistic.controller';
import { StatisticService } from './statistic.service';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([User])],
  controllers: [StatisticController],
  providers: [StatisticService],
})
export class StatisticModule {}
