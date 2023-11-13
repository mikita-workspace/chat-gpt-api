import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';

import { AppModule } from './app/app.module';
import { API_VERSION_DEFAULT } from './common/constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get('port');

  app.use(helmet());

  app.enableVersioning({
    defaultVersion: API_VERSION_DEFAULT,
    type: VersioningType.URI,
  });

  app.useGlobalPipes(new ValidationPipe());

  app.enableCors();

  await app.listen(port, '0.0.0.0');

  Logger.log(`API is running on: ${await app.getUrl()}`, 'src/main.ts');
}
bootstrap();
