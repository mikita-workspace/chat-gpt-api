import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

import { ADMIN_PASSWORD_REGEXP } from '../constants';

export class CreateAdminDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @Matches(ADMIN_PASSWORD_REGEXP, {
    message: 'Weak password',
  })
  password: string;
}
