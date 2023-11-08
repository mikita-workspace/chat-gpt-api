import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { getTimestampPlusSeconds } from 'src/common/utils';
import { AdminsService } from 'src/modules/admins/admins.service';
import { Admin } from 'src/modules/admins/schemas';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly adminsService: AdminsService,
    private readonly jwtService: JwtService,
  ) {}

  async validateAdmin(email: string, password: string): Promise<Admin | null> {
    const admin = await this.adminsService.findOneByEmail(email);

    const isPasswordMatch = await bcrypt.compare(password, admin.password);

    if (isPasswordMatch) {
      return admin;
    }

    return null;
  }

  async login(admin: Admin) {
    const payload = { email: admin.email, sub: admin.adminId, role: admin.role };

    return {
      access_token: this.jwtService.sign(payload),
      expires_at: getTimestampPlusSeconds(Number(this.configService.get('jwt.access_exp'))),
    };
  }
}
