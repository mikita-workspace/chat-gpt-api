import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { getTimestamp } from 'src/common/utils';
import { v4 as uuidv4 } from 'uuid';

import { AdminRoles } from '../constants';

export type AdminDocument = HydratedDocument<Admin>;

@Schema()
export class Admin {
  @Prop({ unique: true, default: uuidv4(), required: true })
  admin_id: string;

  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: String, default: getTimestamp(), required: true })
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
    default: { is_banned: false, ban_reason: '', banned_at: getTimestamp() },
    required: true,
  })
  state: {
    ban_reason: string;
    banned_at: number;
    is_banned: boolean;
  };
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
