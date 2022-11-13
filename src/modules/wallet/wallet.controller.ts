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

import { OperationType } from '../../common/enums/operation-type.enum';
import { UserRoles } from '../../common/enums/user-roles.enum';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { Roles } from '../../decorators/role.decorator';
import { RolesGuard } from '../../guards/roles.guards';
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
  async deposite(@Req() request: Request, @Body() walletDto: WalletDto) {
    const user: JwtPayload = request.user as JwtPayload;
    const userRole = await this.userService.getUserRole(UserRoles.USER);
    await this.walletService.operation(
      walletDto.amount,
      user,
      OperationType.DEPOSITE,
    );

    if (user.role.id === userRole.id) {
      await this.userService.updateUserRole(user.id, UserRoles.INVESTOR);
    }
  }

  @Post('withdraw')
  @Roles(UserRoles.ADMIN, UserRoles.INVESTOR, UserRoles.INVITER)
  @UseGuards(RolesGuard)
  @HttpCode(204)
  async withdraw(@Req() request: Request, @Body() walletDto: WalletDto) {
    const user: JwtPayload = request.user as JwtPayload;
    await this.walletService.checkIfEnoughFounds(
      user.walletId,
      walletDto.amount,
    );
    await this.walletService.operation(
      walletDto.amount,
      user,
      OperationType.WITHDRAW,
    );
  }
}
