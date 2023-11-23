import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type CsmTopicDocument = HydratedDocument<CsmTopic>;

@Schema({ versionKey: false })
export class CsmTopic {
  @Prop({ type: String, unique: true, default: uuidv4(), required: true })
  csmTopicId: string;

  @Prop({ type: String, required: true })
  key: string;

  @Prop({ type: Object, required: true })
  name: Record<string, string>;
}

export const CsmTopicSchema = SchemaFactory.createForClass(CsmTopic);
