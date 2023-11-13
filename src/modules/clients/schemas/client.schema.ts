import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { LanguageCodes, MONTH_IN_DAYS } from 'src/common/constants';
import { getTimestampPlusDays, getTimestampUnix } from 'src/common/utils';
import { ModelGPT, ModelImage, ModelSpeech } from 'src/modules/gpt/constants';

import { ClientImagesRate, ClientNamesRate, ClientTokensRate } from '../constants';
import { ClientImages } from './client-images.schema';
import { ClientMessages } from './client-messages.schema';

export type ClientDocument = HydratedDocument<Client>;

@Schema({ versionKey: false })
export class Client {
  @Prop({ type: Number, unique: true, required: true })
  telegramId: number;

  @Prop({ type: Number, default: getTimestampUnix(), required: true })
  createdAt: number;

  @Prop({ type: Object, default: { username: '', firstname: '', lastname: '' }, required: true })
  metadata: {
    username: string;
    firstname: string;
    lastname: string;
  };

  @Prop({ type: String, default: LanguageCodes.ENGLISH, required: true })
  languageCode: string;

  @Prop({
    type: Object,
    default: {
      expiresAt: getTimestampPlusDays(MONTH_IN_DAYS),
      gptTokens: ClientTokensRate.BASE,
      images: ClientImagesRate.BASE,
      name: ClientNamesRate.BASE,
      symbol: ClientImagesRate.BASE,
    },
    required: true,
  })
  rate: {
    expiresAt: number;
    gptTokens: number;
    images: number;
    name: string;
    symbol: string;
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

  @Prop({
    type: Array,
    default: [ModelGPT.GPT_3_5_TURBO, ModelSpeech.WHISPER_1, ModelImage.DALL_E_3],
    required: true,
  })
  gptModels: string[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: ClientMessages.name, required: true })
  messages: ClientMessages;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: ClientImages.name, required: true })
  images: ClientImages;
}

export const ClientSchema = SchemaFactory.createForClass(Client);
