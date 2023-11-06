import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import { ClientFeedback } from '../constants';

export type ClientImagesSchemaDocument = HydratedDocument<ClientImages>;

@Schema()
export class ClientImages {
  @Prop({ type: String, unique: true, default: uuidv4(), required: true })
  client_images_id: string;

  @Prop({ type: String, unique: true, required: true })
  client_id: string;

  @Prop({ type: Array, default: [], required: true })
  dalle_messages: {
    prompt: string;
    image_links: string[];
    created_at: number;
    feedback: ClientFeedback;
  }[];
}

export const ClientImagesSchema = SchemaFactory.createForClass(ClientImages);
