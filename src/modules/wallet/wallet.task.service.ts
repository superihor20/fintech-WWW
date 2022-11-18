import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OperationType } from '../../common/enums/operation-type.enum';
import { UserRoles } from '../../common/enums/user-roles.enum';
import { makeOperationWithWalletAmount } from '../../common/helpers/make-operation-with-wallet-amount';
import { WalletWithUser } from '../../common/types/wallet-with-user.type';
import { Wallet } from '../../entities';
import { CreateOperationDto } from '../operation/dto/create-operation.dto';
import { OperationService } from '../operation/operation.service';

import { WalletService } from './wallet.service';

@Injectable()
export class WalletTaskService {
  private readonly depositPercent = 1;
  private readonly bonusPercent = 10;

  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    private readonly operationService: OperationService,
    private readonly walletService: WalletService,
  ) {}

  private createIndexTable(wallets: WalletWithUser[]): Record<string, number> {
    const indexTable: Record<string, number> = {};

    wallets.forEach((wallet, index) => {
      indexTable[wallet.userId] = index;
    });

    return indexTable;
  }

  @Cron('0 0 * * *', {
    timeZone: 'Europe/Kiev',
  })
  async dailyDepositeIncreaseAndBonuses() {
    const updatedWallets: Wallet[] = [];
    const operations: CreateOperationDto[] = [];
    const walletsWithDeposits: WalletWithUser[] = await this.walletRepository
      .createQueryBuilder('w')
      .leftJoin('w.user', 'u')
      .leftJoin('u.role', 'r')
      .select('w.id, w.amount')
      .addSelect('u.invited_by', 'invitedBy')
      .addSelect('u.id', 'userId')
      .where(`r.name != '${UserRoles.USER}'`)
      .orderBy('u.id', 'DESC')
      .getRawMany();
    const indexTable = this.createIndexTable(walletsWithDeposits);

    walletsWithDeposits.forEach((wallet) => {
      const { updatedAmount, earnings } = makeOperationWithWalletAmount(
        wallet.amount,
        this.depositPercent,
        OperationType.DAILY_INCREASE,
      );
      const updatedWallet = new Wallet();
      updatedWallet.id = wallet.id;
      updatedWallet.amount = updatedAmount;

      operations.push({
        earnings,
        operationType: OperationType.DAILY_INCREASE,
        userId: wallet.userId,
      });

      if (wallet.invitedBy) {
        const walletOfInviter =
          walletsWithDeposits[indexTable[wallet.invitedBy]];
        const bonus = earnings * (this.bonusPercent / 100);
        walletOfInviter.amount += bonus;
        operations.push({
          earnings: bonus,
          operationType: OperationType.INVITER_BONUS,
          userId: walletOfInviter.userId,
        });
      }
    });

    await this.walletService.update(updatedWallets);
    await this.operationService.create(operations);
  }
}
