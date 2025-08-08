import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

/**
 * 整数解析管道
 * 用于将字符串参数转换为整数
 */
@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException(`参数 ${metadata.data} 必须是有效的整数`);
    }
    return val;
  }
}

/**
 * 可选整数解析管道
 * 用于将可选的字符串参数转换为整数
 */
@Injectable()
export class ParseOptionalIntPipe implements PipeTransform<string | undefined, number | undefined> {
  transform(value: string | undefined, metadata: ArgumentMetadata): number | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException(`参数 ${metadata.data} 必须是有效的整数`);
    }
    return val;
  }
}
