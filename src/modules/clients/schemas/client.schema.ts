import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { LanguageCodes, ModelGPT, MONTH_IN_DAYS } from 'src/common/constants';
import { getTimestampPlusDays, getTimestampUnix } from 'src/common/utils';

import { ClientImagesRate, ClientTokensRate } from '../constants';
import { ClientImages } from './client-images.schema';
import { ClientMessages } from './client-messages.schema';

export type ClientDocument = HydratedDocument<Client>;

@Schema({ versionKey: false })
export class Client {
  @Prop({ type: Number, unique: true, required: true })
  telegramId: number;

  @Prop({ type: Number, default: getTimestampUnix(), required: true })
  createdAt: number;

  @Prop({ type: String, default: '' })
  username: string;

  @Prop({ type: String, default: LanguageCodes.ENGLISH, required: true })
  languageCode: string;

  @Prop({
    type: Object,
    default: {
      dalleImages: ClientImagesRate.BASE,
      expireAt: getTimestampPlusDays(MONTH_IN_DAYS),
      gptTokens: ClientTokensRate.BASE,
    },
    required: true,
  })
  rate: {
    dalleImages: number;
    expireAt: number;
    gptTokens: number;
  };

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

  @Prop({ type: Array, default: [ModelGPT.GPT_3_5_TURBO], required: true })
  gptModels: Array<keyof typeof ModelGPT>;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: ClientMessages.name, required: true })
  gptMessages: ClientMessages;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: ClientImages.name, required: true })
  dalleImages: ClientImages;
}

export const ClientSchema = SchemaFactory.createForClass(Client);