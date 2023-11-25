import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Admin } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { getTimestampPlusSeconds } from '@/common/utils';
import { AdminsService } from '@/modules/admins/admins.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly adminsService: AdminsService,
    private readonly jwtService: JwtService,
  ) {}

  async validateAdmin(email: string, password: string) {
    const admin = await this.adminsService.findOne(email);

    const isPasswordMatch = await bcrypt.compare(password, admin.password);

    if (isPasswordMatch) {
      return admin;
    }

    return null;
  }

  async login(admin: Admin) {
    const payload = { email: admin.email, sub: admin.id, role: admin.role };

    return {
      access_token: this.jwtService.sign(payload),
      expires_at: getTimestampPlusSeconds(Number(this.configService.get('jwt.accessExp'))),
    };
  }
}
