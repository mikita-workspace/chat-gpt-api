import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminsModule } from 'src/admins/admins.module';
import { AuthModule } from 'src/auth/auth.module';
import { ClientsModule } from 'src/clients/clients.module';
import { configuration } from 'src/config';
import { MongoDBModule } from 'src/database';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`,
      isGlobal: true,
      load: [configuration],
    }),
    AdminsModule,
    AuthModule,
    ClientsModule,
    MongoDBModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
