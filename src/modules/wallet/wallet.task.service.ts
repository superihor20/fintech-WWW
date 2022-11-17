import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Not, Repository } from 'typeorm';

import { OperationType } from '../../common/enums/operation-type.enum';
import { UserRoles } from '../../common/enums/user-roles.enum';
import { makeOperationWithWalletAmount } from '../../common/helpers/make-operation-with-wallet-amount';
import { Wallet } from '../../entities';
import { CreateOperationDto } from '../operation/dto/create-operation.dto';
import { OperationService } from '../operation/operation.service';

import { WalletService } from './wallet.service';

@Injectable()
export class WalletTaskService {
  private readonly depositPercent = 1;

  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    private readonly operationService: OperationService,
    private readonly walletService: WalletService,
  ) {}

  @Cron('0 0 * * *', {
    timeZone: 'Europe/Kiev',
  })
  async dailyDepositeIncrease() {
    const walletsWithDeposits = await this.walletRepository.find({
      where: {
        user: {
          role: {
            name: Not(UserRoles.USER),
          },
        },
        amount: MoreThan(0),
      },
      relations: {
        user: true,
      },
    });
    const operations: CreateOperationDto[] = [];
    const updatedWallets = walletsWithDeposits.map((wallet) => {
      const { updatedAmount, earnings } = makeOperationWithWalletAmount(
        wallet.amount,
        this.depositPercent,
        OperationType.DAILY_INCREASE,
      );

      operations.push({
        earnings,
        operationType: OperationType.DAILY_INCREASE,
        userId: wallet.user.id,
      });

      return this.walletRepository.merge(wallet, {
        amount: updatedAmount,
      });
    });

    await this.walletService.update(updatedWallets);
    await this.operationService.create(operations);
  }
}
