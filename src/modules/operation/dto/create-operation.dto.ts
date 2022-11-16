import { IsEnum, IsNumber, IsPositive } from 'class-validator';

import { OperationType } from '../../../common/enums/operation-type.enum';

export class CreateOperationDto {
  @IsEnum(OperationType)
  operationType: OperationType;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsNumber()
  userId: number;
}
