import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateModelDto {
  @IsNotEmpty()
  @IsNumber()
  readonly model: number;
  @IsNotEmpty()
  @IsString()
  readonly title: string;
  @IsNotEmpty()
  @IsString()
  readonly description: string;
  @IsNotEmpty()
  @IsString()
  readonly creator: string;
}
