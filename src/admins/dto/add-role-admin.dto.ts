import { IsNotEmpty, IsString } from 'class-validator';

export class AddRoleAdminDto {
  @IsString()
  @IsNotEmpty()
  readonly role: string;
  @IsString()
  @IsNotEmpty()
  readonly adminId: string;
}
