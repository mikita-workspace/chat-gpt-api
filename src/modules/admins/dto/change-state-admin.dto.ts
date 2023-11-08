import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ChangeStateAdminDto {
  @IsNotEmpty()
  @IsString()
  readonly adminId: string;
  @IsOptional()
  @IsString()
  readonly blockReason?: string;
  @IsBoolean()
  @IsNotEmpty()
  readonly isBlocked: boolean;
}
