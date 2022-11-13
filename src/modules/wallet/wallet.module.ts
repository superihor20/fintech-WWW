import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Wallet } from '../../entities';
import { UserModule } from '../user/user.module';

import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet]), UserModule],
  providers: [WalletService],
  exports: [WalletService],
  controllers: [WalletController],
})
export class WalletModule {}
