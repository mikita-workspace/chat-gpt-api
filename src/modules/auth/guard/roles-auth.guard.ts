import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';

import { ROLES_KEY, TokenTypes } from '../constants';

@Injectable()
export class RolesAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {
    super({
      property: 'admin',
    });
  }

  canActivate(context: ExecutionContext) {
    try {
      const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

      if (!requiredRoles) {
        return true;
      }

      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers.authorization;

      const bearer = authHeader.split(' ')[0];
      const token = authHeader.split(' ')[1];

      if (bearer !== TokenTypes.BEARER || !token) {
        throw new UnauthorizedException();
      }

      const admin = this.jwtService.verify(token);
      request.admin = admin;

      return requiredRoles.includes(admin.role);
    } catch (error) {
      throw new ForbiddenException();
    }
  }
}
