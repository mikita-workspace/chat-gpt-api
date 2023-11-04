import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get('port');

  await app.listen(port, '0.0.0.0');

  Logger.log(`API is running on: ${await app.getUrl()}`);
}
bootstrap();
