import { IsNotEmpty, IsString } from 'class-validator';

export class BanAdminDto {
  @IsNotEmpty()
  @IsString()
  readonly adminId: string;
  @IsNotEmpty()
  @IsString()
  readonly banReason: string;
}
