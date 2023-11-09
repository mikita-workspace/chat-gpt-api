import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { InputGPT } from '../constants';

export type GptModelsDocument = HydratedDocument<GptModels>;

@Schema({ versionKey: false })
export class GptModels {
  @Prop({ type: String, unique: true, required: true })
  model: string;
  @Prop({ type: String, required: true })
  title: string;
  @Prop({ type: String, required: true })
  description: string;
  @Prop({ type: String, required: true })
  creator: string;
  @Prop({ type: Array, default: [InputGPT.TEXT], required: true })
  input: string[];
}

export const GptModelsSchema = SchemaFactory.createForClass(GptModels);
