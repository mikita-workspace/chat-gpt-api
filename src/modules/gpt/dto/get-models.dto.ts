import { IsNotEmpty, IsNumber } from 'class-validator';

export class GetModelsDto {
  @IsNotEmpty()
  @IsNumber()
  readonly telegramId: number;
}
