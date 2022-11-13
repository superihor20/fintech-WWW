import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { Permissions } from '../common/enums/permissions.enum';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: Permissions, unique: true })
  name: Permissions;
}
