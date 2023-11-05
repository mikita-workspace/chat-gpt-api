import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

import { PASSWORD_REGEXP } from '../admins.constants';

export class CreateAdminDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @Matches(PASSWORD_REGEXP, {
    message: 'Weak password',
  })
  password: string;
}
