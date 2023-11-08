import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ChangeStateClientDto {
  @IsNotEmpty()
  @IsNumber()
  readonly telegramId: number;
  @IsOptional()
  @IsString()
  readonly blockReason?: string;
  @IsBoolean()
  @IsOptional()
  readonly isBlocked?: boolean;
  @IsBoolean()
  @IsOptional()
  readonly isApproved?: boolean;
}
