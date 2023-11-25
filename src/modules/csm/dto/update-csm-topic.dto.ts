import { PartialType } from '@nestjs/mapped-types';

import { CreateCsmTopicDto } from './create-csm-topic.dto';

export class UpdateCsmTopicDto extends PartialType(CreateCsmTopicDto) {}
