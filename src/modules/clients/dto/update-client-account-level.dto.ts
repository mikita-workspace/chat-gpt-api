import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateClientAccountLevelDto {
  @IsNotEmpty()
  @IsNumber()
  readonly telegramId: number;
}
