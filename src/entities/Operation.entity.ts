import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { OperationTypes } from '../common/enums/operation-types.enum';

import { User } from './User.entity';

@Entity('operations')
export class Operation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'operation_type',
    type: 'enum',
    enum: OperationTypes,
  })
  operationType: OperationTypes;

  @Column({ type: 'float' })
  earnings: number;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  userId: number;
}
