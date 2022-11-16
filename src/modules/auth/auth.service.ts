import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, compare } from 'bcrypt';

import { ErrorMessages } from '../../common/constants/errors-messages.constant';
import { UserRoles } from '../../common/enums/user-roles.enum';
import { User } from '../../entities';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class AuthService {
  private readonly passwordRounds = 10;
  private readonly emailRounds = 8;

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly walletService: WalletService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return hash(password, this.passwordRounds);
  }

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return compare(password, hashedPassword);
  }

  async validateUser(userDto: CreateUserDto): Promise<User> {
    const foundUser = await this.userService.findOneByEmailUnsafe(
      userDto.email,
    );

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

  async signUp(userDto: CreateUserDto, code?: string) {
    const user = new User();
    user.email = userDto.email;
    user.password = await this.hashPassword(userDto.password);
    user.role = await this.userService.getUserRole(UserRoles.USER);
    user.wallet = await this.walletService.create({ amount: 0 });
    user.inviteCode = await hash(userDto.email, this.emailRounds);

    if (code) {
      const inviter = await this.userService.findOneByInviteCode(code);

      if (!inviter) {
        throw new ConflictException(ErrorMessages.INVITER_CODE_IS_NOT_VALID);
      }

      user.invitedBy = inviter.id;
    }

    const newUser = await this.userService.create(user);

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
