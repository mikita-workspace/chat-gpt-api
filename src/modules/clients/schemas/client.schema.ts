import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { ModelGPT, MONTH_IN_DAYS } from 'src/common/constants';
import { getTimestamp, getTimestampPlusDays } from 'src/common/utils';
import { v4 as uuidv4 } from 'uuid';

import { ClientImagesRate, ClientTokensRate } from '../constants';
import { ClientImages } from './client-images.schema';
import { ClientMessages } from './client-messages.schema';

export type ClientDocument = HydratedDocument<Client>;

@Schema()
export class Client {
  @Prop({ type: String, unique: true, default: uuidv4(), required: true })
  client_id: string;

  @Prop({ type: Number, unique: true, required: true })
  telegram_id: number;

  @Prop({ type: String, default: getTimestamp(), required: true })
  created_at: number;

  @Prop({ type: Number, default: getTimestamp(), required: true })
  updated_at: number;

  @Prop({ type: String, default: '' })
  username: string;

  @Prop({
    type: Object,
    default: {
      gpt_tokens: ClientTokensRate.BASE,
      dalle_images: ClientImagesRate.BASE,
      expire_at: getTimestampPlusDays(MONTH_IN_DAYS),
    },
    required: true,
  })
  rate: {
    gpt_tokens: number;
    dalle_images: number;
    expire_at: number;
  };

  @Prop({ type: Array, default: [ModelGPT.GPT_3_5_TURBO], required: true })
  gpt_models: Array<keyof typeof ModelGPT>;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ClientMessages' })
  gpt_messages: ClientMessages;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ClientImages' })
  dalle_messages: ClientImages;
}

export const ClientSchema = SchemaFactory.createForClass(Client);
