import { forwardRef, Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { ClientsModule } from '../clients/clients.module';
import { SlackModule } from '../slack/slack.module';
import { CsmController } from './csm.controller';
import { CsmService } from './csm.service';
import { CsmTopicService } from './csm-topic.service';

@Module({
  imports: [forwardRef(() => AuthModule), SlackModule, ClientsModule],
  controllers: [CsmController],
  providers: [CsmService, CsmTopicService],
})
export class CsmModule {}
