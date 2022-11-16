import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class CreateOrUpdateWalletDto {
  @IsNumber()
  @Min(0)
  @ApiProperty({ description: 'Should be a positive number', minimum: 0 })
  amount: number;
}
