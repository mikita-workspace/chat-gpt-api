import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { WinstonModule } from 'nest-winston';

import { AppModule } from '@/app/app.module';
import { API_VERSION_DEFAULT } from '@/common/constants';
import { instance as WinstonInstance } from '@/common/helpers';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      instance: WinstonInstance({ slackWebhook: process.env.SLACK_WEBHOOK }),
    }),
  });

  const configService = app.get(ConfigService);
  const port = configService.get('port');

  app.use(helmet());

  app.useGlobalPipes(new ValidationPipe());

  app.enableVersioning({
    defaultVersion: API_VERSION_DEFAULT,
    prefix: 'api/v',
    type: VersioningType.URI,
  });

  app.enableCors();

  await app.listen(port, '0.0.0.0');

  Logger.log(`API is running on: ${await app.getUrl()}`, 'src/main.ts');
}
bootstrap();
