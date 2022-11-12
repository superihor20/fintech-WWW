import { Injectable, NotFoundException } from '@nestjs/common';
import { hash, compare } from 'bcrypt';

import { User } from '../../entities';
import { UserDto } from '../user/dto/user.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  private readonly salt = 10;

  constructor(private readonly userService: UserService) {}

  async hashPassword(password: string): Promise<string> {
    return hash(password, this.salt);
  }

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return compare(password, hashedPassword);
  }

  async validateUser(userDto: UserDto): Promise<User> {
    const foundUser = await this.userService.findOneByEmail(userDto.email);
    const isPasswordValid = await this.compare(
      userDto.password,
      foundUser.password,
    );

    if (!isPasswordValid) {
      throw new NotFoundException('User with this createntials not found');
    }

    return foundUser;
  }

  async signUp(userDto: UserDto): Promise<User> {
    const hashedPassword = await this.hashPassword(userDto.password);

    return this.userService.create({
      ...userDto,
      password: hashedPassword,
    });
  }

  async signIn(userDto: UserDto): Promise<void> {
    await this.validateUser(userDto);

    return;
  }
}
