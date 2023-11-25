import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ChangeStateAdminDto {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;
  @IsOptional()
  @IsString()
  readonly blockReason?: string;
  @IsBoolean()
  @IsNotEmpty()
  readonly isBlocked: boolean;
}
