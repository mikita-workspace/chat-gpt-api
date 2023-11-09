import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { TelegramModule } from '../telegram/telegram.module';
import { GptController } from './gpt.controller';
import { GptService } from './gpt.service';
import { GptModels, GptModelsSchema } from './schemas';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    MongooseModule.forFeature([{ name: GptModels.name, schema: GptModelsSchema }]),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        timeout: configService.get('http.timeout'),
        maxRedirects: configService.get('http.maxRedirects'),
      }),
    }),
    ConfigModule,
    TelegramModule,
  ],
  controllers: [GptController],
  providers: [GptService],
})
export class GptModule {}
