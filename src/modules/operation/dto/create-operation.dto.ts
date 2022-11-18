import { IsEnum, IsNumber, IsPositive } from 'class-validator';

import { OperationTypes } from '../../../common/enums/operation-types.enum';

export class CreateOperationDto {
  @IsEnum(OperationTypes)
  operationType: OperationTypes;

  @IsNumber()
  @IsPositive()
  earnings: number;

  @IsNumber()
  userId: number;
}
