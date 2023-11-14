import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { TypeGPT } from '../constants';

export type GptModelsDocument = HydratedDocument<GptModels>;

@Schema({ versionKey: false })
export class GptModels {
  @Prop({ type: Array, required: true })
  associated: string[];
  @Prop({ type: String, unique: true, required: true })
  model: string;
  @Prop({ type: String, required: true })
  title: string;
  @Prop({ type: String, required: true })
  description: string;
  @Prop({ type: String, required: true })
  creator: string;
  @Prop({ type: String, default: TypeGPT.TEXT, required: true })
  type: string;
  @Prop({ type: Number })
  max: number;
}

export const GptModelsSchema = SchemaFactory.createForClass(GptModels);
