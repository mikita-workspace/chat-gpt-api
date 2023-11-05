import { Controller, Post, Req, UseFilters, UseGuards } from '@nestjs/common';
import { HttpExceptionFilter } from 'src/common/exceptions';

import { AuthService } from './auth.service';
import { RequestWithAdmin } from './auth.types';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('api/auth')
@UseFilters(new HttpExceptionFilter())
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: RequestWithAdmin) {
    return this.authService.login(req.admin);
  }
}
