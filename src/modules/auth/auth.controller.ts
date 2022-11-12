import { Controller, Post, Body, HttpCode } from '@nestjs/common';

import { UserDto } from '../user/dto/user.dto';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  async signUp(@Body() userDto: UserDto) {
    return this.authService.signUp(userDto);
  }

  @Post('sign-in')
  @HttpCode(204)
  async signIn(@Body() userDto: UserDto) {
    return this.authService.signIn(userDto);
  }
}
