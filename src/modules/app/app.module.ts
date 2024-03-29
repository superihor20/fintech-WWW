import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

import { typeormConfig } from '../../configs/typeorm.config';
import { AuthModule } from '../auth/auth.module';
import { StatisticModule } from '../statistic/statistic.module';
import { UserModule } from '../user/user.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: typeormConfig,
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UserModule,
    WalletModule,
    StatisticModule,
  ],
})
export class AppModule {}
