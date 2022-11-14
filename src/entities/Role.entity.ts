import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { UserRoles } from '../common/enums/user-roles.enum';

import { User } from './User.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: UserRoles, unique: true })
  name: UserRoles;

  @OneToMany(() => User, (user) => user)
  users: User[];
}
