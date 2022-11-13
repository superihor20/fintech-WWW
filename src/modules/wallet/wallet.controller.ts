import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { UserRoles } from '../../common/enums/user-roles.enum';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { UserService } from '../user/user.service';

import { WalletDto } from './dto/wallet.dto';
import { WalletService } from './wallet.service';

@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly userService: UserService,
  ) {}

  @Get()
  async findOne(@Req() request: Request) {
    const user: JwtPayload = request.user as JwtPayload;

    return this.walletService.findOne(user.walletId);
  }

  @Post('deposite')
  @HttpCode(204)
  async deposit(@Req() request: Request, @Body() walletDto: WalletDto) {
    const user: JwtPayload = request.user as JwtPayload;
    this.walletService.deposite(walletDto.amount, user.walletId);
    this.userService.updateUserRole(user.id, UserRoles.INVESTOR);
  }
}
