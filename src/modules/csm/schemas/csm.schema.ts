import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import { getTimestampUnix } from '@/common/utils';
import { Admin } from '@/modules/admins/schemas';

import { CsmStatus } from '../constants';
import { CsmTopic } from './csm-topics.schema';

export type CsmDocument = HydratedDocument<Csm>;

@Schema({ versionKey: false })
export class Csm {
  @Prop({ type: String, unique: true, default: uuidv4(), required: true })
  csmId: string;

  @Prop({ type: String, unique: true, required: true })
  ticketNumber: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: CsmTopic.name, required: true })
  topic: CsmTopic;

  @Prop({ type: String, enum: CsmStatus, default: CsmStatus.NEW, required: true })
  status: CsmStatus;

  @Prop({ type: Number, default: getTimestampUnix(), required: true })
  createdAt: number;

  @Prop({ type: Number, default: getTimestampUnix(), required: true })
  updatedAt: number;

  @Prop({ type: String, default: '', required: true })
  description: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Admin.name })
  assigned: Admin;
}

export const CsmSchema = SchemaFactory.createForClass(Csm);
