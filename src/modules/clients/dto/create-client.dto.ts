import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateClientDto {
  @IsNotEmpty()
  @IsNumber()
  readonly telegramId: number;
  @IsNotEmpty()
  @IsString()
  readonly languageCode: string;
  @IsOptional()
  @IsString()
  readonly username?: string;
}
