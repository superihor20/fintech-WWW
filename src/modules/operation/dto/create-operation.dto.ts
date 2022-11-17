import { IsEnum, IsNumber, IsPositive } from 'class-validator';

import { OperationType } from '../../../common/enums/operation-type.enum';

export class CreateOperationDto {
  @IsEnum(OperationType)
  operationType: OperationType;

  @IsNumber()
  @IsPositive()
  earnings: number;

  @IsNumber()
  userId: number;
}
