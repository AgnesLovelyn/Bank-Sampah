import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const isHttpException = exception instanceof HttpException;
    const statusCode = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = isHttpException ? exception.getResponse() : null;

    let message: string;
    let errors: any = null;

    if (isHttpException && typeof exceptionResponse === 'object') {
      const body: any = exceptionResponse;
      // ValidationPipe ngirim message sebagai array of string, HttpException lain biasanya string
      if (Array.isArray(body.message)) {
        message = 'Validasi gagal.';
        errors = body.message;
      } else {
        message = body.message ?? 'Terjadi kesalahan.';
      }
    } else if (isHttpException) {
      message = exceptionResponse as string;
    } else {
      // Error tak terduga (bukan HttpException) — jangan bocorin detail internal ke client
      message = 'Terjadi kesalahan pada server.';
      console.error(exception); // tetap dicatat di log server buat debugging
    }

    response.status(statusCode).json({
      statusCode,
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString(),
    });
  }
}