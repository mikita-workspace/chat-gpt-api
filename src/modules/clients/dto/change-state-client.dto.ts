import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ChangeStateClientDto {
  @IsNotEmpty()
  @IsString()
  readonly telegramId: string;
  @IsOptional()
  @IsString()
  readonly blockReason: string;
  @IsBoolean()
  @IsOptional()
  readonly isBlocked: boolean;
  @IsBoolean()
  @IsOptional()
  readonly isApproved: boolean;
}
