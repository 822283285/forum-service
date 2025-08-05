import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseDto } from '../dto/response.dto';

/**
 * 响应拦截器 - 统一包装响应格式
 */
@Injectable()
export class ResponseInterceptor<T = any>
  implements NestInterceptor<T, ResponseDto<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ResponseDto<T>> {
    return next.handle().pipe(
      map((data: T): ResponseDto<T> => {
        // 如果数据已经是 ResponseDto 格式，直接返回
        if (data instanceof ResponseDto) {
          return data as ResponseDto<T>;
        }

        // 获取响应状态码
        const response = context
          .switchToHttp()
          .getResponse<{ statusCode?: number }>();
        const statusCode: number = response.statusCode || 200;

        // 根据状态码设置消息
        let message = '操作成功';
        if (statusCode >= 400) {
          message = '操作失败';
        }

        // 包装为统一格式
        return ResponseDto.success<T>(data, message);
      }),
    );
  }
}
