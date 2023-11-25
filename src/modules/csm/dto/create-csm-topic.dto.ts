import { IsBoolean, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateCsmTopicDto {
  @IsOptional()
  @IsBoolean()
  readonly isPrivate: boolean;

  @IsNotEmpty()
  @IsObject()
  readonly name: Record<string, string>;

  @IsNotEmpty()
  @IsString()
  readonly key: string;
}
