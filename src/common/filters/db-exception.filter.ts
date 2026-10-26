import {
  DriverException,
  UniqueConstraintViolationException,
} from '@mikro-orm/core';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

const DB_HTTP_MAP: Record<string, { status: number; message: string }> = {
  UniqueConstraintViolationException: {
    status: HttpStatus.CONFLICT,
    message: '数据已存在',
  },
};

@Catch(UniqueConstraintViolationException)
export class DbExceptionFilter<T> implements ExceptionFilter {
  catch(exception: DriverException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const name = exception.name;
    const { status } = DB_HTTP_MAP[name];
    response.status(status).json(DB_HTTP_MAP[name]);
  }
}
