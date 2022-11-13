import { IsNumber, Min } from 'class-validator';

export class WalletDto {
  @IsNumber()
  @Min(0)
  amount: number;
}
