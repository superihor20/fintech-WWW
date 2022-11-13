import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, compare } from 'bcrypt';

import { ErrorMessagesEnums } from '../../common/enums/errors-messages.enum';
import { User } from '../../entities';
import { UserDto } from '../user/dto/user.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  private readonly salt = 10;

  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return hash(password, this.salt);
  }

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return compare(password, hashedPassword);
  }

  async validateUser(userDto: UserDto): Promise<User> {
    const foundUser = await this.userService.findOneByEmail(userDto.email);

    if (!foundUser) {
      throw new NotFoundException(ErrorMessagesEnums.USER_NOT_FOUND);
    }

    const isPasswordValid = await this.compare(
      userDto.password,
      foundUser.password,
    );

    if (!isPasswordValid) {
      throw new NotFoundException(ErrorMessagesEnums.USER_NOT_FOUND);
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

  async signIn(user: User) {
    const payload = { email: user.email, sub: user.id };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
