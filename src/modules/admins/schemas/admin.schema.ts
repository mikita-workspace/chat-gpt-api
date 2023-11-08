import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { getTimestampUnix } from 'src/common/utils';
import { v4 as uuidv4 } from 'uuid';

import { AdminRoles } from '../constants';

export type AdminDocument = HydratedDocument<Admin>;

@Schema({ versionKey: false })
export class Admin {
  @Prop({ type: String, unique: true, default: uuidv4(), required: true })
  admin_id: string;

  @Prop({ type: String, unique: true, required: true })
  email: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: Number, default: getTimestampUnix(), required: true })
  created_at: number;

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
    default: { is_blocked: false, block_reason: '', updated_at: getTimestampUnix() },
    required: true,
  })
  state: {
    block_reason: string;
    updated_at: number;
    is_blocked: boolean;
  };
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
