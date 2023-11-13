import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class GenerateImagesDto {
  @IsNotEmpty()
  @IsNumber()
  readonly telegramId: number;
  @IsNotEmpty()
  @IsNumber()
  readonly messageId: number;
  @IsNotEmpty()
  @IsString()
  readonly model: string;
  @IsNotEmpty()
  @IsNumber()
  @Max(3)
  @Min(1)
  readonly amount: number;
  @IsNotEmpty()
  @IsString()
  readonly prompt: string;
  @IsOptional()
  @IsBoolean()
  readonly useCloudinary: boolean;
}
