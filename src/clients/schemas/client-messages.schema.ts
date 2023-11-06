import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type ClientMessagesDocument = HydratedDocument<ClientMessages>;

@Schema()
export class ClientMessages {
  @Prop({ type: String, unique: true, default: uuidv4(), required: true })
  client_messages_id: string;

  @Prop({ type: String, unique: true, required: true })
  client_id: string;

  @Prop({ type: Array, default: [], required: true })
  gpt_messages: { gpt_format: { content: string; role: string }; created_at: number }[];
}

export const ClientMessagesSchema = SchemaFactory.createForClass(ClientMessages);
