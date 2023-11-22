import { Module } from '@nestjs/common';

import { CsmController } from './csm.controller';
import { CsmService } from './csm.service';

@Module({
  controllers: [CsmController],
  providers: [CsmService],
})
export class CsmModule {}
