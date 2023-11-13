import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateModelDto {
  @IsNotEmpty()
  @IsString()
  readonly model: string;
  @IsNotEmpty()
  @IsString()
  readonly title: string;
  @IsNotEmpty()
  @IsString()
  readonly description: string;
  @IsNotEmpty()
  @IsString()
  readonly creator: string;
  @IsOptional()
  @IsString()
  readonly input: string;
  @IsOptional()
  @IsNumber()
  readonly max: number;
}
