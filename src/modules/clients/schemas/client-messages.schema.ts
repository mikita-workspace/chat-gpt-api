import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { GptMessage } from 'src/modules/gpt/constants';
import { v4 as uuidv4 } from 'uuid';

import { ClientFeedback } from '../constants';

export type ClientMessagesDocument = HydratedDocument<ClientMessages>;

@Schema({ versionKey: false })
export class ClientMessages {
  @Prop({ type: String, unique: true, default: uuidv4(), required: true })
  clientMessagesId: string;

  @Prop({ type: Number, unique: true, required: true })
  telegramId: number;

  @Prop({ type: Array, default: [], required: true })
  gptMessages: {
    createdAt: number;
    feedback: ClientFeedback;
    gptFormat: GptMessage;
  }[];
}

export const ClientMessagesSchema = SchemaFactory.createForClass(ClientMessages);
