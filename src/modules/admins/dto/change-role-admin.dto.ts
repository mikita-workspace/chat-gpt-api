import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

import { AdminRole } from '../constants';

export class ChangeRoleAdminDto {
  @IsEnum(AdminRole)
  @IsNotEmpty()
  @IsString()
  readonly role: AdminRole;
  @IsNotEmpty()
  @IsString()
  readonly adminId: string;
}
