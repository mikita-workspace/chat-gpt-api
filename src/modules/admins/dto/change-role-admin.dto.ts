import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { AdminRoles } from '../constants';

export class ChangeRoleAdminDto {
  @IsEnum(AdminRoles)
  @IsNotEmpty()
  @IsString()
  readonly role: AdminRoles;
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;
}
