import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { LocaleCodes, MONTH_IN_DAYS } from 'src/common/constants';
import { getTimestampPlusDays, getTimestampUnix } from 'src/common/utils';
import { gptModelsBase } from 'src/modules/gpt/constants';

import { ClientImagesRate, ClientNamesRate, ClientTokensRate } from '../constants';
import { ClientRate } from '../types';
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
      gptTokens: ClientTokensRate.BASE,
      images: ClientImagesRate.BASE,
      name: ClientNamesRate.BASE,
      symbol: '',
    },
    required: true,
  })
  rate: ClientRate;

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
