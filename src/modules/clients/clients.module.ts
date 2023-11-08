import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { TelegramModule } from '../telegram/telegram.module';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { Client, ClientSchema } from './schemas';
import { ClientImages, ClientImagesSchema } from './schemas/client-images.schema';
import { ClientMessages, ClientMessagesSchema } from './schemas/client-messages.schema';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    MongooseModule.forFeature([
      { name: Client.name, schema: ClientSchema },
      { name: ClientMessages.name, schema: ClientMessagesSchema },
      { name: ClientImages.name, schema: ClientImagesSchema },
    ]),
    TelegramModule,
  ],
  controllers: [ClientsController],
  providers: [ClientsService],
})
export class ClientsModule {}
