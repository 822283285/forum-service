import { ApiProperty } from '@nestjs/swagger';

/**
 * 统一响应格式
 */
export class ResponseDto<T = any> {
  @ApiProperty({ description: '状态码', example: 200 })
  code: number;

  @ApiProperty({ description: '响应消息', example: '操作成功' })
  message: string;

  @ApiProperty({ description: '响应数据' })
  data: T;

  @ApiProperty({ description: '时间戳', example: 1640995200000 })
  timestamp: number;

  constructor(code: number, message: string, data: T) {
    this.code = code;
    this.message = message;
    this.data = data;
    this.timestamp = Date.now();
  }

  /**
   * 成功响应
   */
  static success<T>(data: T, message = '操作成功'): ResponseDto<T> {
    return new ResponseDto(200, message, data);
  }

  /**
   * 失败响应
   */
  static error<T>(code: number, message: string, data: T): ResponseDto<T> {
    return new ResponseDto(code, message, data);
  }
}

/**
 * 分页响应数据
 */
export class PaginationDto<T> {
  @ApiProperty({ description: '数据列表' })
  items: T[];

  @ApiProperty({ description: '总数量', example: 100 })
  total: number;

  @ApiProperty({ description: '当前页码', example: 1 })
  page: number;

  @ApiProperty({ description: '每页数量', example: 10 })
  limit: number;

  @ApiProperty({ description: '总页数', example: 10 })
  totalPages: number;

  constructor(items: T[], total: number, page: number, limit: number) {
    this.items = items;
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
  }
}
