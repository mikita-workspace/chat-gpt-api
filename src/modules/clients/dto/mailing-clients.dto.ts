import { IsBoolean, IsNotEmpty, IsNumber, IsObject, IsOptional } from 'class-validator';

export class ClientsMailingDto {
  @IsNotEmpty()
  @IsNumber({}, { each: true })
  readonly telegramIds: number[];
  @IsNotEmpty()
  @IsObject()
  readonly message: Record<string, string>;
  @IsBoolean()
  @IsOptional()
  readonly sendToEveryone?: boolean;
}
