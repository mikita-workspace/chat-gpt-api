import { IsNotEmpty, IsNumber, IsObject, IsOptional } from 'class-validator';

export class CreateClientDto {
  @IsNotEmpty()
  @IsNumber()
  readonly telegramId: number;
  @IsOptional()
  @IsObject()
  readonly metadata: {
    firstname: string;
    languageCode: string;
    lastname?: string;
    username?: string;
  };
}
