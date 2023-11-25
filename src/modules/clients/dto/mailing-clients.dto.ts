import { IsNotEmpty, IsNumber, IsObject } from 'class-validator';

export class ClientsMailingDto {
  @IsNotEmpty()
  @IsNumber({}, { each: true })
  readonly telegramIds: number[];
  @IsNotEmpty()
  @IsObject()
  readonly message: Record<string, string>;
}
