import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request, Response } from 'express';

import { ErrorMessages } from '../../common/constants/errors-messages.constant';
import { OperationType } from '../../common/enums/operation-type.enum';
import { UserRoles } from '../../common/enums/user-roles.enum';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { Roles } from '../../decorators/role.decorator';
import { RolesGuard } from '../../guards/roles.guards';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { UserService } from '../user/user.service';

import { CreateOrUpdateWalletDto } from './dto/create-or-update-wallet.dto';
import { WalletDto } from './dto/wallet.dto';
import { WalletService } from './wallet.service';

@ApiTags('Wallet')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly userService: UserService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get current user wallet' })
  @ApiOkResponse({ type: WalletDto })
  async findOne(@Req() request: Request) {
    const user: JwtPayload = request.user as JwtPayload;

    return this.walletService.findOne(user.walletId);
  }

  @Post('deposite')
  @HttpCode(204)
  @ApiOperation({ summary: 'Make a deposite to the current user wallet' })
  @ApiNoContentResponse()
  async deposite(
    @Req() request: Request,
    @Body() walletDto: CreateOrUpdateWalletDto,
  ) {
    const user: JwtPayload = request.user as JwtPayload;
    const userRole = await this.userService.getUserRole(UserRoles.USER);
    await this.walletService.operation(
      user.walletId,
      walletDto.amount,
      OperationType.DEPOSITE,
    );

    if (user.role.id === userRole.id) {
      await this.userService.updateUserRole(user.id, UserRoles.INVESTOR);
    }
  }

  @Post('withdraw')
  @Roles(UserRoles.ADMIN, UserRoles.INVESTOR, UserRoles.INVITER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Withdraw from current user wallet' })
  @ApiNoContentResponse()
  @ApiOkResponse({ type: 'string' })
  @ApiConflictResponse({ description: ErrorMessages.NOT_ENOUGH_MONEY })
  async withdraw(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Body() walletDto: CreateOrUpdateWalletDto,
  ) {
    const user: JwtPayload = request.user as JwtPayload;

    if (user.role.name === UserRoles.ADMIN) {
      response.statusCode = 200;
      return this.walletService.giveMeThatMoney(walletDto.amount);
    }

    await this.walletService.checkIfEnoughFounds(
      user.walletId,
      walletDto.amount,
    );
    await this.walletService.operation(
      user.walletId,
      walletDto.amount,
      OperationType.WITHDRAW,
    );
    response.statusCode = 204;
  }
}
