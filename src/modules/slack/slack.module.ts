import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { SlackService } from './slack.service';

@Module({
  imports: [ConfigModule],
  providers: [SlackService, Logger],
  exports: [SlackService],
})
export class SlackModule {}
