import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  @ApiProperty({ description: 'Should be email', required: false })
  email: string;

  @IsString()
  @MinLength(8)
  @IsOptional()
  @ApiProperty({ minLength: 8, required: false })
  password: string;
}
