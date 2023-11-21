import { CacheModule } from '@nestjs/cache-manager';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { redisStore } from 'cache-manager-redis-yet';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import * as path from 'path';

import { LocaleCodes } from '@/common/constants';
import { HttpExceptionFilter } from '@/common/exceptions';
import { configuration } from '@/config';
import { MongoDBModule } from '@/database';
import { AdminsModule } from '@/modules/admins/admins.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { ClientsModule } from '@/modules/clients/clients.module';
import { CloudinaryModule } from '@/modules/cloudinary/cloudinary.module';
import { GithubModule } from '@/modules/github/github.module';
import { GptModule } from '@/modules/gpt/gpt.module';
import { OpenAiModule } from '@/modules/openai/openai.module';
import { SberModule } from '@/modules/sber/sber.module';
import { SlackModule } from '@/modules/slack/slack.module';
import { TelegramModule } from '@/modules/telegram/telegram.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`,
      isGlobal: true,
      load: [configuration],
    }),
    I18nModule.forRoot({
      fallbackLanguage: LocaleCodes.ENGLISH,
      loaderOptions: {
        path: path.join(__dirname, '../i18n/'),
        watch: true,
      },
      resolvers: [{ use: QueryResolver, options: ['lang'] }, AcceptLanguageResolver],
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get('http.timeout'),
          limit: config.get('http.maxRedirects'),
        },
      ],
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: async (configService: ConfigService) => {
        const redis = await redisStore({
          url: configService.get('cache.redisUrl'),
          ttl: configService.get('cache.ttl'),
        });

        if (process.env.NODE_ENV === 'production') {
          return <{ store: () => Awaited<ReturnType<typeof redisStore>> }>{
            store: () => redis,
          };
        }

        return {
          ttl: configService.get('cache.ttl'),
        };
      },
    }),
    AdminsModule,
    AuthModule,
    ClientsModule,
    CloudinaryModule,
    GithubModule,
    GptModule,
    MongoDBModule,
    OpenAiModule,
    SberModule,
    SlackModule,
    TelegramModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    Logger,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
  exports: [CacheModule],
})
export class AppModule {}
