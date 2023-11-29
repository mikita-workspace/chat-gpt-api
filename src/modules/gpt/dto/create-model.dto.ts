import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

import { TypeGPT } from '../constants';

export class CreateModelDto {
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  associated: string[];
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
  @IsNotEmpty()
  @IsEnum(TypeGPT)
  readonly type: string;
  @IsOptional()
  @IsNumber()
  readonly max: number;
}
