import { IsOptional, IsString, IsUrl } from 'class-validator';

export class ProfileDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  familyName?: string;

  @IsOptional()
  @IsUrl()
  picture?: string;
}
