import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Query,
  HttpCode,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';

import { ErrorMessages } from '../../common/constants/errors-messages.constant';
import { User } from '../../entities';
import { UserDto } from '../user/dto/user.dto';

import { AuthService } from './auth.service';
import { TokenDto } from './dtos/token.dto';
import { LocalAuthGuard } from './guards/local.guard';

@ApiTags('Auth')
@ApiBadRequestResponse({ description: 'Bad Request' })
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  @ApiQuery({ name: 'code', type: 'string', required: false })
  @ApiResponse({
    status: 201,
    description: 'User was create',
    type: TokenDto,
  })
  @ApiResponse({
    status: 409,
    description: ErrorMessages.INVITER_CODE_IS_NOT_VALID,
  })
  async signUp(@Body() userDto: UserDto, @Query('code') code?: string) {
    return this.authService.signUp(userDto, code);
  }

  @UseGuards(LocalAuthGuard)
  @Post('sign-in')
  @HttpCode(200)
  @ApiBody({ required: true, type: UserDto })
  @ApiOkResponse({
    description: 'Successfully signed in',
    type: TokenDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  async signIn(@Req() req: Request) {
    if (req.user instanceof User) {
      return this.authService.signIn(req.user);
    }
  }
}
