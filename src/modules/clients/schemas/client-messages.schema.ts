import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import { ClientFeedback } from '../constants';

export type ClientMessagesDocument = HydratedDocument<ClientMessages>;

@Schema({ versionKey: false })
export class ClientMessages {
  @Prop({ type: String, unique: true, default: uuidv4(), required: true })
  client_messages_id: string;

  @Prop({ type: String, unique: true, required: true })
  client_id: string;

  @Prop({ type: Array, default: [], required: true })
  gpt_messages: {
    created_at: number;
    feedback: ClientFeedback;
    gpt_format: { content: string; role: string };
  }[];
}

export const ClientMessagesSchema = SchemaFactory.createForClass(ClientMessages);
