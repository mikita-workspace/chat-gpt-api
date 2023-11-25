import { Module } from '@nestjs/common';

import { CsmController } from './csm.controller';
import { CsmService } from './csm.service';
import { CsmTopicService } from './csm-topic.service';

@Module({
  controllers: [CsmController],
  providers: [CsmService, CsmTopicService],
})
export class CsmModule {}
