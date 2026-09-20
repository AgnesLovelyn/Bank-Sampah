import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => ({
        statusCode: response.statusCode,
        success: true,
        message: this.getDefaultMessage(request.method),
        data,
      })),
    );
  }

  private getDefaultMessage(method: string): string {
    switch (method) {
      case 'POST':
        return 'Data berhasil dibuat.';
      case 'PUT':
      case 'PATCH':
        return 'Data berhasil diperbarui.';
      case 'DELETE':
        return 'Data berhasil dihapus.';
      default:
        return 'Data berhasil diambil.';
    }
  }
}