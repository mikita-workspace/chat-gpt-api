import { IsNotEmpty, IsString } from 'class-validator';

export class BanAdminDto {
  @IsString()
  @IsNotEmpty()
  readonly adminId: string;
  @IsString()
  readonly banReason: string;
}
