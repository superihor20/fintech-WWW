import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';

import { ErrorMessages } from '../../common/enums/errors-messages.enum';
import { OperationType } from '../../common/enums/operation-type.enum';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { Wallet } from '../../entities';

import { WalletDto } from './dto/wallet.dto';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
  ) {}

  async create(walletDto: WalletDto) {
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

  async update(id: number, walletDto: WalletDto) {
    const foundWallet = await this.findOne(id);
    this.walletRepository.merge(foundWallet, walletDto);

    return this.walletRepository.save(foundWallet);
  }

  async operation(amount: number, user: JwtPayload, type: OperationType) {
    const wallet = await this.findOne(user.walletId);
    let updatedAmount = wallet.amount;

    switch (type) {
      case OperationType.DEPOSITE:
        updatedAmount += amount;
        break;
      case OperationType.WITHDRAW:
        updatedAmount -= amount;
        break;
    }

    this.update(user.walletId, { amount: updatedAmount });
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
}
