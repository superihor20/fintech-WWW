import { UserRoles } from '../enums/user-roles.enum';

export const rolesWeight = {
  [UserRoles.USER]: 0,
  [UserRoles.INVESTOR]: 1,
  [UserRoles.INVITER]: 2,
  [UserRoles.ADMIN]: 9,
};
