import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { getTimestampUnix } from 'src/common/utils';
import { v4 as uuidv4 } from 'uuid';

import { AdminRoles } from '../constants';

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
    enum: AdminRoles,
    default: AdminRoles.MODERATOR,
    required: true,
  })
  role: AdminRoles;

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
