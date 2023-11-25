import { forwardRef, Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { ClientsModule } from '../clients/clients.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { OpenAiModule } from '../openai/openai.module';
import { SberModule } from '../sber/sber.module';
import { TelegramModule } from '../telegram/telegram.module';
import { GptController } from './gpt.controller';
import { GptService } from './gpt.service';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    ClientsModule,
    CloudinaryModule,
    OpenAiModule,
    SberModule,
    TelegramModule,
  ],
  controllers: [GptController],
  providers: [GptService],
})
export class GptModule {}
