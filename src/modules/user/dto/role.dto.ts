import { ApiResponseProperty } from '@nestjs/swagger';

import { UserRoles } from '../../../common/enums/user-roles.enum';

export class RoleDto {
  @ApiResponseProperty()
  id: number;

  @ApiResponseProperty()
  name: UserRoles;
}
