import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, MoreThan, Not, Repository } from 'typeorm';

import { ErrorMessages } from '../../common/constants/errors-messages.constant';
import { OperationType } from '../../common/enums/operation-type.enum';
import { UserRoles } from '../../common/enums/user-roles.enum';
import { makeOperationWithWalletAmount } from '../../common/helpers/make-operation-with-wallet-amount';
import { Wallet } from '../../entities';
import { CreateOperationDto } from '../operation/dto/create-operation.dto';
import { OperationService } from '../operation/operation.service';

@Injectable()
export class WalletService {
  private readonly depositPercent = 1;

  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    private readonly operationService: OperationService,
  ) {}

  async create(wallet: Wallet) {
    return this.walletRepository.save(wallet);
  }

  private async findOneBy(filters: FindOptionsWhere<Wallet>): Promise<Wallet> {
    const foundWallet = await this.walletRepository.findOneBy(filters);

    if (!foundWallet) {
      throw new NotFoundException();
    }

    return foundWallet;
  }

  async findOne(id: number): Promise<Wallet> {
    return this.findOneBy({ id });
  }

  async update(wallet: Wallet | Wallet[]) {
    return Array.isArray(wallet)
      ? this.walletRepository.save(wallet)
      : this.walletRepository.save(wallet);
  }

  async operation(
    wallet: Wallet,
    operationAmount: number,
    type: OperationType,
  ) {
    const { updatedAmount, earnings } = makeOperationWithWalletAmount(
      wallet.amount,
      operationAmount,
      type,
    );

    await this.update(
      this.walletRepository.merge(wallet, { amount: updatedAmount }),
    );
    await this.operationService.create([
      {
        operationType: type,
        earnings,
        userId: wallet.user.id,
      },
    ]);
  }

  async checkIfEnoughFounds(
    walletId: number,
    amount: number,
  ): Promise<boolean> {
    const wallet = await this.findOne(walletId);

    if (amount > wallet.amount) {
      throw new ConflictException(ErrorMessages.NOT_ENOUGH_MONEY);
    }

    return true;
  }

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

    await this.update(updatedWallets);
    await this.operationService.create(operations);
  }

  async giveMeThatMoney(operationAmount: number, adminId: number) {
    const adminWallet = await this.walletRepository.findOne({
      where: { user: { id: adminId } },
    });

    if (adminWallet.amount >= operationAmount) {
      this.update(
        this.walletRepository.merge(adminWallet, {
          amount: adminWallet.amount - operationAmount,
        }),
      );

      return `Successfully withdrawn ${operationAmount}`;
    }

    const totalAmount = await this.walletRepository
      .createQueryBuilder('wallets')
      .select('SUM(wallets.amount)', 'totalAmount')
      .getRawOne();

    if (operationAmount > totalAmount) {
      throw new ConflictException(
        ErrorMessages.NOT_ENOUGH_MONEY_TO_STEAL(operationAmount, totalAmount),
      );
    }

    const wallets: (Wallet & { total: number })[] =
      await this.walletRepository.query(
        `select * from 
        (
          select w.*, sum(w.amount) over (order by r.id desc, w.amount desc) as total
          from wallets as w
          left join users as u 
          on u.wallet_id = w.id
          left join roles as r
          on u.role_id = r.id
          where w.amount > 0
        ) t 
        where total - amount < ?`,
        [operationAmount],
      );

    let rest = operationAmount;
    let prevRest = rest;
    const updatedWallets = wallets.map((wallet) => {
      prevRest = rest;
      rest = Math.max(0, rest - wallet.amount);
      wallet.amount = Math.max(0, wallet.amount - prevRest);

      return wallet;
    });

    await this.update(updatedWallets);

    return `Successfully stolen ${operationAmount}`;
  }
}
