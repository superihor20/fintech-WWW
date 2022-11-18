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
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request, Response } from 'express';

import { ErrorMessages } from '../../common/constants/errors-messages.constant';
import { OperationTypes } from '../../common/enums/operation-types.enum';
import { UserRoles } from '../../common/enums/user-roles.enum';
import { JwtPayload } from '../../common/types/jwt-payload.type';
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
    const user = request.user as JwtPayload;

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
    const user = request.user as JwtPayload;
    const foundUser = await this.userService.findOne(user.id);
    const userRole = await this.userService.getUserRole(UserRoles.USER);

    await this.walletService.operation(
      foundUser.wallet,
      walletDto.amount,
      OperationTypes.DEPOSITE,
    );

    if (foundUser.role.id === userRole.id) {
      const inviteCode = await this.userService.generateInviteCode(user.email);

      await this.userService.updateUserRole(user.id, UserRoles.INVESTOR);
      await this.userService.update(user.id, { inviteCode });
    }
  }

  @Post('withdraw')
  @Roles(UserRoles.ADMIN, UserRoles.INVESTOR, UserRoles.INVITER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Withdraw from current user wallet' })
  @ApiNoContentResponse()
  @ApiOkResponse({ type: 'string' })
  @ApiConflictResponse({ description: ErrorMessages.NOT_ENOUGH_MONEY })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  async withdraw(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Body() walletDto: CreateOrUpdateWalletDto,
  ) {
    const user = request.user as JwtPayload;
    const foundUser = await this.userService.findOne(user.id);

    if (foundUser.role.name === UserRoles.ADMIN) {
      response.statusCode = 200;
      return this.walletService.giveMeThatMoney(walletDto.amount, user.id);
    }

    await this.walletService.checkIfEnoughFounds(
      user.walletId,
      walletDto.amount,
    );
    await this.walletService.operation(
      foundUser.wallet,
      walletDto.amount,
      OperationTypes.WITHDRAW,
    );
    response.statusCode = 204;
  }
}
