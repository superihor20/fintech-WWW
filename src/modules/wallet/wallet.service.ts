import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';

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

  async deposite(amount: number, walletId: number) {
    const wallet = await this.findOne(walletId);
    this.update(walletId, { amount: amount + wallet.amount });
  }
}
