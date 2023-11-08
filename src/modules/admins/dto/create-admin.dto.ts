import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

import { ADMIN_PASSWORD_REGEXP } from '../constants';

export class CreateAdminDto {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsString()
  @Matches(ADMIN_PASSWORD_REGEXP)
  @MaxLength(20)
  @MinLength(4)
  readonly password: string;
}
