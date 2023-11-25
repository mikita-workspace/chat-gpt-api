import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';

import { TokenType } from '../constants';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly jwtService: JwtService) {
    super({
      property: 'admin',
    });
  }

  canActivate(context: ExecutionContext) {
    try {
      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers.authorization;

      const bearer = authHeader.split(' ')[0];
      const token = authHeader.split(' ')[1];

      if (bearer !== TokenType.BEARER || !token) {
        throw new UnauthorizedException();
      }

      const admin = this.jwtService.verify(token);
      request.admin = admin;

      return true;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
