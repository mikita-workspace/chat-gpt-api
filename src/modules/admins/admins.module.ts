import { forwardRef, Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth/auth.module';

import { AdminsController } from './admins.controller';
import { AdminsService } from './admins.service';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [AdminsController],
  providers: [AdminsService],
  exports: [AdminsService],
})
export class AdminsModule {}
