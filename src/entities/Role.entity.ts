import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { rolesWeight } from '../common/constants/roles-weight.constant';
import { UserRoles } from '../common/enums/user-roles.enum';

import { User } from './User.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: UserRoles, unique: true })
  name: UserRoles;

  @Column({ type: 'int', default: rolesWeight[UserRoles.USER] })
  weight: number;

  @OneToMany(() => User, (user) => user)
  users: User[];
}
