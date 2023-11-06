import { Controller, Get, Post, Req, UseFilters, UseGuards } from '@nestjs/common';
import { HttpExceptionFilter } from 'src/common/exceptions';

import { AuthService } from './auth.service';
import { JwtAuthGuard, LocalAuthGuard } from './guard';
import { RequestWithAdmin } from './types';

@Controller('api/auth')
@UseFilters(new HttpExceptionFilter())
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: RequestWithAdmin) {
    return this.authService.login(req.admin);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: RequestWithAdmin) {
    return req.admin;
  }
}
