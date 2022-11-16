import { ApiResponseProperty } from '@nestjs/swagger';

export class TokenDto {
  @ApiResponseProperty()
  access_token: string;
}
