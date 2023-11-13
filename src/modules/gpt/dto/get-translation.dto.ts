import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class GetTranslationDto {
  @IsNotEmpty()
  @IsString()
  readonly filename: string;
  @IsNotEmpty()
  @IsNumber()
  readonly telegramId: number;
  @IsNotEmpty()
  @IsString()
  readonly model: string;
}
