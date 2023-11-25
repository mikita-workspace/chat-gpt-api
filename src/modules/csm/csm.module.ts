import { Module } from '@nestjs/common';

import { ClientsModule } from '../clients/clients.module';
import { SlackModule } from '../slack/slack.module';
import { CsmController } from './csm.controller';
import { CsmService } from './csm.service';
import { CsmTopicService } from './csm-topic.service';

@Module({
  imports: [SlackModule, ClientsModule],
  controllers: [CsmController],
  providers: [CsmService, CsmTopicService],
})
export class CsmModule {}
