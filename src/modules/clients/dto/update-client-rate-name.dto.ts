import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

import { ClientNamesRate } from '../constants';

export class UpdateClientRateNameDto {
  @IsNotEmpty()
  @IsNumber()
  readonly telegramId: number;
  @IsNotEmpty()
  @IsEnum(ClientNamesRate)
  readonly name: ClientNamesRate;
}
