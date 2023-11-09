import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
  @IsArray()
  readonly input: string[];
}
