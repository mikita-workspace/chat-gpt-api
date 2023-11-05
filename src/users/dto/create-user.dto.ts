import { IsString } from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'Username should be string' })
  username: string;
}
