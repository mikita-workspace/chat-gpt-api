import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

import { LocaleCodes, MONTH_IN_DAYS } from '@/common/constants';
import { getTimestampPlusDays, getTimestampUnix } from '@/common/utils';
import { gptModelsBase } from '@/modules/gpt/constants';

import { ClientImagesLevel, ClientNamesLevel, ClientTokensLevel } from '../constants';
import { ClientAccountLevel } from '../types';
import { ClientImages } from './client-images.schema';
import { ClientMessages } from './client-messages.schema';

export type ClientDocument = HydratedDocument<Client>;

@Schema({ versionKey: false })
export class Client {
  @Prop({ type: Number, unique: true, required: true })
  telegramId: number;

  @Prop({ type: Number, default: getTimestampUnix(), required: true })
  createdAt: number;

  @Prop({
    type: Object,
    default: { username: '', firstname: '', lastname: '', languageCode: LocaleCodes.ENGLISH },
    required: true,
  })
  metadata: {
    firstname: string;
    languageCode: string;
    lastname?: string;
    username?: string;
  };

  @Prop({
    type: Object,
    default: {
      expiresAt: getTimestampPlusDays(MONTH_IN_DAYS),
      gptModels: gptModelsBase,
      gptTokens: ClientTokensLevel.BASE,
      images: ClientImagesLevel.BASE,
      name: ClientNamesLevel.BASE,
      symbol: '',
    },
    required: true,
  })
  accountLevel: ClientAccountLevel;

  @Prop({
    type: Object,
    default: {
      blockReason: '',
      isApproved: false,
      isBlocked: false,
      updatedAt: getTimestampUnix(),
    },
    required: true,
  })
  state: {
    blockReason: string;
    isApproved: boolean;
    isBlocked: boolean;
    updatedAt: number;
  };

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: ClientMessages.name, required: true })
  messages: ClientMessages;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: ClientImages.name, required: true })
  images: ClientImages;
}

export const ClientSchema = SchemaFactory.createForClass(Client);
