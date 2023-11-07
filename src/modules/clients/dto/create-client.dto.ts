import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateClientDto {
  @IsNotEmpty()
  @IsNumber()
  telegramId: number;
  @IsOptional()
  @IsString()
  username: string;
}
