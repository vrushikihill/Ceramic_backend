import { Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  logger = new Logger(AllExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    this.logger.error({
      stack: exception?.stack,
      message: exception?.message,
      status: exception?.status,
      name: exception?.name,
      error: exception?.error,
      endpoint: host?.getArgs()?.[0]?.url,
    });
    super.catch(exception, host);
  }
}
