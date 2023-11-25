import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

import { getTimestampUtc } from '../utils';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

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

    if (request.url.includes('api')) {
      this.logger.error(
        'HttpExceptionFilter',
        {
          headers: request.headers,
          body: request.body,
          query: request.query,
          params: request.params,
          url: request.url,
          error: exceptionResponse,
        },
        'src/common/exceptions/http-exception.filter.ts',
      );
    }

    response.status(status).json({
      statusCode: status,
      error: exceptionResponse.error,
      message: exceptionResponse.message || exceptionResponse?.description,
      timestamp: getTimestampUtc(),
      path: request.url,
    });
  }
}
