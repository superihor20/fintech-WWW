import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, MoreThan, Repository } from 'typeorm';

import { ErrorMessages } from '../../common/constants/errors-messages.constant';
import { OperationType } from '../../common/enums/operation-type.enum';
import { UserRoles } from '../../common/enums/user-roles.enum';
import { makeOperationWithWalletAmount } from '../../common/helpers/make-operation-with-wallet-amount';
import { Wallet } from '../../entities';
import { CreateOperationDto } from '../operation/dto/create-operation.dto';
import { OperationService } from '../operation/operation.service';

import { CreateOrUpdateWalletDto } from './dto/create-or-update-wallet.dto';

@Injectable()
export class WalletService {
  private readonly depositPercent = 1;

  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    private readonly operationService: OperationService,
  ) {}

  async create(walletDto: CreateOrUpdateWalletDto) {
    return this.walletRepository.save(walletDto);
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

  async update(wallet: Wallet) {
    return this.walletRepository.save(wallet);
  }

  async operation(walletId: number, amount: number, type: OperationType) {
    const wallet = await this.walletRepository.findOne({
      select: { id: true, amount: true },
      where: { id: walletId },
      relations: { user: true },
    });

    const updatedAmount = makeOperationWithWalletAmount(
      wallet.amount,
      amount,
      type,
    );
    const earnings = (wallet.amount - updatedAmount) * -1;

    await this.update(
      this.walletRepository.merge(wallet, { amount: updatedAmount }),
    );
    await this.operationService.create([
      {
        operationType: type,
        amount: earnings,
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
      where: [
        {
          user: {
            role: {
              name: UserRoles.INVESTOR,
            },
          },
          amount: MoreThan(0),
        },
        {
          user: {
            role: {
              name: UserRoles.INVITER,
            },
          },
          amount: MoreThan(0),
        },
      ],
      relations: {
        user: true,
      },
    });
    const operations: CreateOperationDto[] = [];
    const updatedWallets = walletsWithDeposits.map((wallet) => {
      const updatedAmount = makeOperationWithWalletAmount(
        wallet.amount,
        this.depositPercent,
        OperationType.DAILY_INCREASE,
      );
      const earnings = (wallet.amount - updatedAmount) * -1;

      operations.push({
        amount: earnings,
        operationType: OperationType.DAILY_INCREASE,
        userId: wallet.user.id,
      });

      return this.walletRepository.merge(wallet, {
        amount: updatedAmount,
      });
    });

    await this.walletRepository.save(updatedWallets);
    await this.operationService.create(operations);
  }

  async giveMeThatMoney(amount: number) {
    let rest = amount;
    let prevRest = rest;
    const wallets: (Wallet & { total: number })[] =
      await this.walletRepository.query(
        `select * from (select *, sum(amount) over (order by amount asc) as total from wallets where amount > 0) t where  total - amount < ${amount}`,
      );
    const [{ total }] = await this.walletRepository.query(
      `select sum(amount) as total from wallets`,
    );

    if (total < amount) {
      throw new ConflictException(
        ErrorMessages.NOT_ENOUGH_MONEY_TO_STEAL(amount, total),
      );
    }

    const updatedWallets = wallets.map((wallet) => {
      prevRest = rest;
      rest = Math.max(0, rest - wallet.amount);
      wallet.amount = Math.max(0, wallet.amount - prevRest);

      return wallet;
    });

    await this.walletRepository.save(updatedWallets);

    return `Successfully stolen ${amount}`;
  }
}
