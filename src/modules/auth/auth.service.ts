import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, compare } from 'bcrypt';

import { ErrorMessages } from '../../common/constants/errors-messages.constant';
import { UserRoles } from '../../common/enums/user-roles.enum';
import { User } from '../../entities';
import { UserDto } from '../user/dto/user.dto';
import { UserService } from '../user/user.service';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class AuthService {
  private readonly salt = 10;

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly walletService: WalletService,
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
      throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
    }

    const isPasswordValid = await this.compare(
      userDto.password,
      foundUser.password,
    );

    if (!isPasswordValid) {
      throw new NotFoundException(ErrorMessages.USER_NOT_FOUND);
    }

    return foundUser;
  }

  async signUp(userDto: UserDto) {
    const hashedPassword = await this.hashPassword(userDto.password);
    const userRole = await this.userService.getUserRole(UserRoles.USER);
    const newWallet = await this.walletService.create({ amount: 0 });
    const newUser = await this.userService.create(
      {
        ...userDto,
        password: hashedPassword,
      },
      newWallet,
      userRole,
    );

    return this.signIn(newUser);
  }

  async signIn(user: User) {
    const payload = {
      email: user.email,
      id: user.id,
      role: user.role,
      walletId: user.wallet.id,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
