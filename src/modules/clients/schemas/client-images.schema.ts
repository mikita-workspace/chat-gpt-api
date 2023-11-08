import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import { ClientFeedback } from '../constants';

export type ClientImagesSchemaDocument = HydratedDocument<ClientImages>;

@Schema({ versionKey: false })
export class ClientImages {
  @Prop({ type: String, unique: true, default: uuidv4(), required: true })
  clientImagesId: string;

  @Prop({ type: Number, unique: true, required: true })
  telegramId: number;

  @Prop({ type: Array, default: [], required: true })
  dalleImages: {
    createdAt: number;
    feedback: ClientFeedback;
    imageLinks: string[];
    prompt: string;
  }[];
}

export const ClientImagesSchema = SchemaFactory.createForClass(ClientImages);
