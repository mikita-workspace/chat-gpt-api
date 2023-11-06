import { Request } from 'express';
import { Admin } from 'src/admins/schemas';

export interface RequestWithAdmin extends Request {
  admin: Admin;
}

export type AdminJwtPayload = {
  email: string;
  sub: string;
};
