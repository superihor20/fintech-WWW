import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserRoles } from '../common/enums/user-roles.enum';

import { Permission } from './Permission.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: UserRoles, unique: true })
  name: UserRoles;

  @ManyToMany(() => Permission, { eager: true })
  @JoinTable({
    name: 'role_to_permission',
    joinColumns: [{ name: 'role_id', referencedColumnName: 'id' }],
    inverseJoinColumns: [{ name: 'permission_id', referencedColumnName: 'id' }],
  })
  permissions: Permission[];
}
