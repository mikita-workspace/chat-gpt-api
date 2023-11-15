import { IsNotEmpty, IsNumber, IsObject } from 'class-validator';

export class UpdateClientMetadataDto {
  @IsNotEmpty()
  @IsNumber()
  readonly telegramId: number;
  @IsNotEmpty()
  @IsObject()
  readonly metadata: {
    firstname: string;
    languageCode: string;
    lastname?: string;
    username?: string;
  };
}
