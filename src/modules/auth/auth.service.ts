import { Injectable, NotFoundException } from '@nestjs/common';
import { hash, compare } from 'bcrypt';

import { UserDto } from '../user/dto/user.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  private readonly salt = 10;

  constructor(private readonly userService: UserService) {}

  async hashPassword(password: string) {
    return hash(password, this.salt);
  }

  async compare(password: string, hashedPassword: string) {
    return compare(password, hashedPassword);
  }

  async validateUser(password: string, hashedPassword: string) {
    return this.compare(password, hashedPassword);
  }

  async signUp(userDto: UserDto) {
    const hashedPassword = await this.hashPassword(userDto.password);

    return this.userService.create({
      ...userDto,
      password: hashedPassword,
    });
  }

  async signIn(userDto: UserDto) {
    const foundUser = await this.userService.findOneByEmail(userDto.email);
    const isPasswordValid = await this.validateUser(
      userDto.password,
      foundUser.password,
    );

    if (!isPasswordValid) {
      throw new NotFoundException('User with this createntials not found');
    }

    return;
  }
}
