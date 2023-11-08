import { Controller, Get, HttpStatus, Req, UseFilters } from '@nestjs/common';
import { HttpExceptionFilter } from 'src/common/exceptions';
import { getTimestampUnix } from 'src/common/utils';

import { AppService } from './app.service';

@UseFilters(new HttpExceptionFilter())
@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getInitial(@Req() req: Request) {
    return {
      statusCode: HttpStatus.OK,
      message: this.appService.getInitial(),
      timestamp: getTimestampUnix(),
      path: req.url,
    };
  }
}
