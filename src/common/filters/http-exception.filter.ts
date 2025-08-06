import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseDto } from '../dto/response.dto';

/**
 * HTTP异常过滤器 - 统一错误响应格式
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    // 获取异常响应内容
    const exceptionResponse = exception.getResponse();
    let message = exception.message;
    let errors = null;

    // 处理验证错误
    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const responseObj = exceptionResponse as Record<string, any>;
      if (responseObj.message) {
        if (Array.isArray(responseObj.message)) {
          message = responseObj.message.join(', ');
          errors = responseObj.message;
        } else {
          message = responseObj.message as string;
        }
      }
    }

    // 根据状态码设置默认消息
    if (!message) {
      switch (status as HttpStatus) {
        case HttpStatus.BAD_REQUEST:
          message = '请求参数错误';
          break;
        case HttpStatus.UNAUTHORIZED:
          message = '未授权访问';
          break;
        case HttpStatus.FORBIDDEN:
          message = '禁止访问';
          break;
        case HttpStatus.NOT_FOUND:
          message = '资源不存在';
          break;
        case HttpStatus.CONFLICT:
          message = '资源冲突';
          break;
        case HttpStatus.INTERNAL_SERVER_ERROR:
          message = '服务器内部错误';
          break;
        default:
          message = '操作失败';
      }
    }

    // 构造错误响应
    const errorResponse = ResponseDto.error(status, message, errors);

    // 记录错误日志
    console.error(`HTTP Exception: ${status} - ${message}`, `Path: ${request.url}`, `Method: ${request.method}`, exception.stack);

    response.status(status).json(errorResponse);
  }
}
