import { Admin } from '@prisma/client';
import { Request } from 'express';

export interface RequestWithAdmin extends Request {
  admin: Admin;
}

export type AdminJwtPayload = {
  email: string;
  sub: string;
};
