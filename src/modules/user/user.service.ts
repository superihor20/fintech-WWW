import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcrypt';
import { FindManyOptions, FindOptionsWhere, Repository } from 'typeorm';

import { UserRoles } from '../../common/enums/user-roles.enum';
import { Role, User, Wallet } from '../../entities';
import { UpdateUserDto } from '../auth/dto/update-user.dto';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class UserService {
  private readonly inviteCodeRounds = 8;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly walletService: WalletService,
  ) {}

  async create(user: User): Promise<User> {
    const newUser = await this.userRepository.save(user);
    const wallet = new Wallet();
    newUser.wallet = await this.walletService.create(wallet);

    return this.userRepository.save(newUser);
  }

  private async findOneBy(filters: FindOptionsWhere<User>): Promise<User> {
    const foundUser = await this.userRepository.findOneBy(filters);

    if (!foundUser) {
      throw new NotFoundException();
    }

    return foundUser;
  }

  async findOne(id: number): Promise<User> {
    return this.findOneBy({ id });
  }

  async findOneByEmail(email: string): Promise<User> {
    return this.findOneBy({ email });
  }

  async findOneByEmailUnsafe(email: string): Promise<User> {
    return this.userRepository.findOne({
      select: { email: true, password: true, id: true },
      where: { email },
    });
  }

  async findOneByInviteCode(code: string): Promise<User> {
    return this.userRepository.findOneBy({ inviteCode: code });
  }

  async findWithFilter(
    filter?: FindManyOptions<User>,
  ): Promise<[User[], number]> {
    return this.userRepository.findAndCount(filter);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    this.userRepository.delete(id);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const foundUser = await this.findOne(id);
    this.userRepository.merge(foundUser, updateUserDto);

    return this.userRepository.save(foundUser);
  }

  async updateUserRole(id: number, role: UserRoles) {
    const foundRole = await this.getUserRole(role);
    const foundUser = await this.findOne(id);

    this.userRepository.merge(foundUser, { role: foundRole });

    return this.userRepository.save(foundUser);
  }

  async getUserRole(name: UserRoles): Promise<Role> {
    return this.roleRepository.findOneBy({ name });
  }

  async generateInviteCode(email: string): Promise<string> {
    return hash(email, this.inviteCodeRounds);
  }
}
