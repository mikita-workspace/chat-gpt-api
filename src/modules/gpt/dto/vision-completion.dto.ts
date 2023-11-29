import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class VisionCompletionDto {
  @IsNotEmpty()
  @IsString()
  readonly message: string;
  @IsNotEmpty()
  @IsNumber()
  readonly messageId: number;
  @IsNotEmpty()
  @IsString()
  readonly filename: string;
  @IsNotEmpty()
  @IsString()
  readonly model: string;
  @IsNotEmpty()
  @IsNumber()
  readonly telegramId: number;
  @IsOptional()
  @IsBoolean()
  readonly useCloudinary: boolean;
}
