import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { getTimestamp } from 'src/common/utils';
import { v4 as uuidv4 } from 'uuid';

import { AdminRoles } from '../constants';

export type AdminDocument = HydratedDocument<Admin>;

@Schema()
export class Admin {
  @Prop({ unique: true, default: uuidv4(), required: true })
  adminId: string;

  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: String, default: getTimestamp(), required: true })
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
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
