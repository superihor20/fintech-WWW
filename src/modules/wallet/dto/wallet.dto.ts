import { ApiResponseProperty } from '@nestjs/swagger';

export class WalletDto {
  @ApiResponseProperty()
  id: number;

  @ApiResponseProperty()
  amount: number;
}
