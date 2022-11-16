import { Controller, Post, Body, UseGuards, Req, Query } from '@nestjs/common';
import { Request } from 'express';

import { User } from '../../entities';
import { UserDto } from '../user/dto/user.dto';

import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  async signUp(@Body() userDto: UserDto, @Query('code') code?: string) {
    return this.authService.signUp(userDto, code);
  }

  @UseGuards(LocalAuthGuard)
  @Post('sign-in')
  async signIn(@Req() req: Request) {
    if (req.user instanceof User) {
      return this.authService.signIn(req.user);
    }
  }
}
