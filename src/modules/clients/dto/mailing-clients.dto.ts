import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ClientsMailingDto {
  @IsNotEmpty()
  @IsNumber({}, { each: true })
  readonly telegramIds: number[];
  @IsNotEmpty()
  @IsString()
  readonly message: string;
}
