import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import * as path from 'path';
import { LanguageCodes } from 'src/common/constants';
import { configuration } from 'src/config';
import { MongoDBModule } from 'src/database';
import { AdminsModule } from 'src/modules/admins/admins.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { ClientsModule } from 'src/modules/clients/clients.module';
import { GptModule } from 'src/modules/gpt/gpt.module';
import { TelegramModule } from 'src/modules/telegram/telegram.module';

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
      fallbackLanguage: LanguageCodes.ENGLISH,
      loaderOptions: {
        path: path.join(__dirname, '../i18n/'),
        watch: true,
      },
      resolvers: [{ use: QueryResolver, options: ['lang'] }, AcceptLanguageResolver],
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: async (configService: ConfigService) => ({
        ttl: configService.get('cache.ttl'),
      }),
    }),
    AdminsModule,
    AuthModule,
    ClientsModule,
    GptModule,
    MongoDBModule,
    TelegramModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [CacheModule],
})
export class AppModule {}
