import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';

import { ErrorMessages } from '../../common/constants/errors-messages.constant';
import { OperationTypes } from '../../common/enums/operation-types.enum';
import { makeOperationWithWalletAmount } from '../../common/helpers/make-operation-with-wallet-amount';
import { Wallet } from '../../entities';
import { OperationService } from '../operation/operation.service';

@Injectable()
export class WalletService {
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
    type: OperationTypes,
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
