import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { ModelGPT, MONTH_IN_DAYS } from 'src/common/constants';
import { getTimestamp, getTimestampPlusDays } from 'src/common/utils';

import { ClientImagesRate, ClientTokensRate } from '../constants';
import { ClientImages } from './client-images.schema';
import { ClientMessages } from './client-messages.schema';

export type ClientDocument = HydratedDocument<Client>;

@Schema({ versionKey: false })
export class Client {
  @Prop({ type: Number, unique: true, required: true })
  telegram_id: number;

  @Prop({ type: Number, default: getTimestamp(), required: true })
  created_at: number;

  @Prop({ type: String, default: '' })
  username: string;

  @Prop({
    type: Object,
    default: {
      dalle_images: ClientImagesRate.BASE,
      expire_at: getTimestampPlusDays(MONTH_IN_DAYS),
      gpt_tokens: ClientTokensRate.BASE,
    },
    required: true,
  })
  rate: {
    dalle_images: number;
    expire_at: number;
    gpt_tokens: number;
  };

  @Prop({
    type: Object,
    default: { is_approved: false, is_banned: false, ban_reason: '', updated_at: getTimestamp() },
    required: true,
  })
  state: {
    ban_reason: string;
    is_approved: boolean;
    is_banned: boolean;
    updated_at: number;
  };

  @Prop({ type: Array, default: [ModelGPT.GPT_3_5_TURBO], required: true })
  gpt_models: Array<keyof typeof ModelGPT>;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ClientMessages' })
  gpt_messages: ClientMessages;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ClientImages' })
  dalle_messages: ClientImages;
}

export const ClientSchema = SchemaFactory.createForClass(Client);
