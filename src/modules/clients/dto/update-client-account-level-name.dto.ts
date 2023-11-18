import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

import { ClientNamesLevel } from '../constants';

export class UpdateClientAccountLevelNameDto {
  @IsNotEmpty()
  @IsNumber()
  readonly telegramId: number;
  @IsNotEmpty()
  @IsEnum(ClientNamesLevel)
  readonly name: ClientNamesLevel;
}
