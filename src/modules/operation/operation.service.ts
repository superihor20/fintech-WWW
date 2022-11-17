import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Operation } from '../../entities';

import { CreateOperationDto } from './dto/create-operation.dto';

@Injectable()
export class OperationService {
  constructor(
    @InjectRepository(Operation)
    private readonly operationRepository: Repository<Operation>,
  ) {}

  async create(createOperationDto: CreateOperationDto[]) {
    this.operationRepository.save(createOperationDto);
  }
}
