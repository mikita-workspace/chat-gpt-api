import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCsmDto {
  @IsNotEmpty()
  @IsNumber()
  readonly telegramId: number;

  @IsNotEmpty()
  @IsString()
  readonly description: string;

  @IsNotEmpty()
  @IsString()
  readonly key: string;
}
