import { IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateClientDto {
  @IsNotEmpty()
  @IsNumber()
  readonly telegramId: number;
  @IsNotEmpty()
  @IsString()
  readonly languageCode: string;
  @IsOptional()
  @IsObject()
  readonly metadata: {
    username?: string;
    firstname?: string;
    lastname?: string;
  };
}
