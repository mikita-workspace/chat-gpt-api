import { Controller, Get, HttpStatus, Req } from '@nestjs/common';

import { getTimestampUtc } from '@/common/utils';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getInitial(@Req() req: Request) {
    return {
      statusCode: HttpStatus.OK,
      message: this.appService.getInitial(),
      timestamp: getTimestampUtc(),
      path: req.url,
    };
  }
}
