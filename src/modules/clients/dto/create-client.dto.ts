import { IsNotEmpty, IsNumber, IsObject, IsOptional } from 'class-validator';

export class CreateClientDto {
  @IsNotEmpty()
  @IsNumber()
  readonly telegramId: number;
  @IsOptional()
  @IsObject()
  readonly metadata: {
    username?: string;
    firstname?: string;
    lastname?: string;
    languageCode: string;
  };
}
