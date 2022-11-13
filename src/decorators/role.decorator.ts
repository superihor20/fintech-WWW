import { SetMetadata } from '@nestjs/common';

import { UserRoles } from '../common/enums/user-roles.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRoles[]) => SetMetadata(ROLES_KEY, roles);
