import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class GetTranslationDto {
  @IsNotEmpty()
  @IsString()
  readonly voicePathApi: string;
  @IsNotEmpty()
  @IsNumber()
  readonly telegramId: number;
  @IsNotEmpty()
  @IsString()
  readonly model: string;
}
