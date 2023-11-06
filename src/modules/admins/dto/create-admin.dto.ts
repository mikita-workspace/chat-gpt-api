import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

import { ADMIN_PASSWORD_REGEXP } from '../constants';

export class CreateAdminDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @Matches(ADMIN_PASSWORD_REGEXP, {
    message: 'Weak password',
  })
  @MaxLength(20)
  @MinLength(4)
  password: string;
}
