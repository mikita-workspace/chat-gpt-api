import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

import { ClientNameLevel } from '../constants';

export class UpdateClientAccountLevelNameDto {
  @IsNotEmpty()
  @IsNumber()
  readonly telegramId: number;
  @IsNotEmpty()
  @IsEnum(ClientNameLevel)
  readonly name: ClientNameLevel;
}
