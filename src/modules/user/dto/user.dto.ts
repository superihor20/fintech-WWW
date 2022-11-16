import { ApiResponseProperty } from '@nestjs/swagger';

import { WalletDto } from '../../../modules/wallet/dto/wallet.dto';

import { RoleDto } from './role.dto';

export class UserDto {
  @ApiResponseProperty()
  id: number;

  @ApiResponseProperty()
  email: string;

  @ApiResponseProperty()
  password: string;

  @ApiResponseProperty()
  invitedBy: number;

  @ApiResponseProperty()
  inviteCode: string;

  @ApiResponseProperty()
  createdAt: Date;

  @ApiResponseProperty()
  updatedAt: Date;

  @ApiResponseProperty()
  role: RoleDto;

  @ApiResponseProperty()
  wallet: WalletDto;
}
