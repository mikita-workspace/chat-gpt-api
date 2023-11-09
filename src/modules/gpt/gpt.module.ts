import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { GptController } from './gpt.controller';
import { GptService } from './gpt.service';
import { GptModelsSchema } from './schemas';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: GptService.name, schema: GptModelsSchema }]),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        timeout: configService.get('http.timeout'),
        maxRedirects: configService.get('http.maxRedirects'),
      }),
    }),
    ConfigModule,
  ],
  controllers: [GptController],
  providers: [GptService],
})
export class GptModule {}
