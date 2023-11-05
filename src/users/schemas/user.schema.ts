import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { ModelGPT } from 'src/common/constants';

import { UserRoles } from '../users.constants';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop()
  email: string;

  @Prop({ type: MongooseSchema.Types.Array, default: [ModelGPT.GPT_3_5_TURBO], required: true })
  gptModels: string[];

  @Prop({ type: Boolean, default: false, required: true })
  isBlocked: boolean;

  @Prop()
  password: string;

  @Prop({ type: Number, default: Date.now(), required: true })
  registeredAt: number;

  @Prop({ type: String, enum: UserRoles, default: UserRoles.USER, required: true })
  role: UserRoles;

  @Prop({ unique: true, required: true })
  username: string;

  // TODO
  // @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Owner' }] })
  // owner: Owner[];
}

export const UserSchema = SchemaFactory.createForClass(User);
