import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import { getTimestampUnix } from '@/common/utils';

import { AdminRole } from '../constants';

export type AdminDocument = HydratedDocument<Admin>;

@Schema({ versionKey: false })
export class Admin {
  @Prop({ type: String, unique: true, default: uuidv4(), required: true })
  adminId: string;

  @Prop({ type: String, unique: true, required: true })
  email: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: Number, default: getTimestampUnix(), required: true })
  createdAt: number;

  @Prop({
    type: String,
    enum: AdminRole,
    default: AdminRole.MODERATOR,
    required: true,
  })
  role: AdminRole;

  @Prop({ type: String, default: '' })
  username: string;

  @Prop({
    type: Object,
    default: { blockReason: '', updatedAt: getTimestampUnix(), isBlocked: false },
    required: true,
  })
  state: {
    blockReason: string;
    updatedAt: number;
    isBlocked: boolean;
  };
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
