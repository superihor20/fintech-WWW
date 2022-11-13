import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';

import { UserRoles } from '../../common/enums/user-roles.enum';
import { Profile, Role, User, Wallet } from '../../entities';

import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async create(
    userDto: UserDto,
    profile: Profile,
    wallet: Wallet,
    userRole: Role,
  ): Promise<User> {
    return this.userRepository.save({
      ...userDto,
      profile,
      wallet,
      role: userRole,
    });
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
    const adminRole = await this.getUserRole(UserRoles.ADMIN);

    if (foundUser.role.id === adminRole.id) {
      return;
    }

    this.userRepository.merge(foundUser, { role: foundRole });

    return this.userRepository.save(foundUser);
  }

  async getUserRole(name: UserRoles): Promise<Role> {
    return this.roleRepository.findOneBy({ name });
  }
}
