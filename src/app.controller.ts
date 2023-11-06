import { Controller, Get, HttpStatus, Req, UseFilters } from '@nestjs/common';

import { AppService } from './app.service';
import { HttpExceptionFilter } from './common/exceptions';
import { getTimestamp } from './common/utils';

@UseFilters(new HttpExceptionFilter())
@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getInitial(@Req() req: Request) {
    return {
      statusCode: HttpStatus.OK,
      message: this.appService.getInitial(),
      timestamp: getTimestamp(),
      path: req.url,
    };
  }
}
