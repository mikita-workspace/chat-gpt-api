import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateClientRateDto {
  @IsNotEmpty()
  @IsNumber()
  readonly telegramId: number;
}
