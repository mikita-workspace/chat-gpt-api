import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AdminsService } from 'src/admins/admins.service';
import { Admin } from 'src/admins/schemas/admin.schema';

@Injectable()
export class AuthService {
  constructor(
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
    const payload = { username: admin.email, sub: admin.adminId };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
