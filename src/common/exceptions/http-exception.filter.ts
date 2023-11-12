import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

import { getTimestampUnix } from '../utils';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as {
      description: string;
      error: string;
      message: string;
    };

    console.log(exceptionResponse);

    response.status(status).json({
      statusCode: status,
      error: exceptionResponse.error,
      message: exceptionResponse.message || exceptionResponse?.description,
      timestamp: getTimestampUnix(),
      path: request.url,
    });
  }
}
