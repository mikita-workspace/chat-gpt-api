import { PartialType } from '@nestjs/mapped-types';
import { IsEmail } from 'class-validator';

import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsEmail({}, { message: 'Email is not correct' })
  email: string;
}
