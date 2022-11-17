import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Operation } from '../../entities';

import { OperationService } from './operation.service';

@Module({
  imports: [TypeOrmModule.forFeature([Operation])],
  providers: [OperationService],
  exports: [OperationService],
})
export class OperationModule {}
