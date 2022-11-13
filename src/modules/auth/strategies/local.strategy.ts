import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { ErrorMessagesEnums } from '../../../common/enums/errors-messages.enum';
import { User } from '../../../entities';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<User> {
    const user = await this.authService.validateUser({
      email,
      password,
    });

    if (!user) {
      throw new UnauthorizedException(ErrorMessagesEnums.USER_NOT_FOUND);
    }

    return user;
  }
}
