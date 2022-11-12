import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { UserRoles } from '../common/enums/user-roles.enum';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: UserRoles, unique: true })
  name: UserRoles;
}
