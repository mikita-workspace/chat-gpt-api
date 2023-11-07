import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateClientDto {
  @IsNotEmpty()
  @IsNumber()
  telegramId: number;
}
