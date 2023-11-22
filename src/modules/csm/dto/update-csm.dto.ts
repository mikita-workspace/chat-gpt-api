import { PartialType } from '@nestjs/mapped-types';

import { CreateCsmDto } from './create-csm.dto';

export class UpdateCsmDto extends PartialType(CreateCsmDto) {}
