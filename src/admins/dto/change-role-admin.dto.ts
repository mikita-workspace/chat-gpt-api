import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { AdminRoles } from '../constants';

export class ChangeRoleAdminDto {
  @IsEnum(AdminRoles)
  @IsNotEmpty()
  @IsString()
  readonly role: string;
  @IsNotEmpty()
  @IsString()
  readonly adminId: string;
}
