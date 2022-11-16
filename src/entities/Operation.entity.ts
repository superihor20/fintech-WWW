import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { OperationType } from '../common/enums/operation-type.enum';

import { User } from './User.entity';

@Entity('operations')
export class Operation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'operation_type',
    type: 'enum',
    enum: OperationType,
  })
  operationType: OperationType;

  @Column({ type: 'float' })
  amount: number;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  userId: number;
}
