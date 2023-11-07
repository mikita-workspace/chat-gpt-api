import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import { ClientFeedback } from '../constants';

export type ClientImagesSchemaDocument = HydratedDocument<ClientImages>;

@Schema({ versionKey: false })
export class ClientImages {
  @Prop({ type: String, unique: true, default: uuidv4(), required: true })
  client_images_id: string;

  @Prop({ type: String, unique: true, required: true })
  telegram_id: string;

  @Prop({ type: Array, default: [], required: true })
  dalle_messages: {
    created_at: number;
    feedback: ClientFeedback;
    image_links: string[];
    prompt: string;
  }[];
}

export const ClientImagesSchema = SchemaFactory.createForClass(ClientImages);
