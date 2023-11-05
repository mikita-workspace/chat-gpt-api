import { Request } from 'express';
import { Admin } from 'src/admins/schemas/admin.schema';

export interface RequestWithAdmin extends Request {
  admin: Admin;
}
