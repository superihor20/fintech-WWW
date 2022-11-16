import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class WalletDto {
  @IsNumber()
  @Min(0)
  @ApiProperty({ description: 'Should be a positive number', minimum: 0 })
  amount: number;
}
