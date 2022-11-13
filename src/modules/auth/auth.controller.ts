import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';

import { UserDto } from '../user/dto/user.dto';

import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local.guards';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  async signUp(@Body() userDto: UserDto) {
    return this.authService.signUp(userDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('sign-in')
  async signIn(@Req() req: Request) {
    return req.user;
  }
}
