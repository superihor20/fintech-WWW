import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Wallet } from '../../entities';
import { OperationModule } from '../operation/operation.module';
import { UserModule } from '../user/user.module';

import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { WalletTaskService } from './wallet.task.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet]),
    forwardRef(() => UserModule),
    OperationModule,
  ],
  providers: [WalletService, WalletTaskService],
  exports: [WalletService],
  controllers: [WalletController],
})
export class WalletModule {}
