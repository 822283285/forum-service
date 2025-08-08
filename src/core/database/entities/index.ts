/**
 * 数据库实体统一导出文件
 * 用于集中管理所有实体的导入导出
 */

import { Menu } from '../../../modules/menu/entities/menu.entity';
import { Permission } from '../../../modules/permission/entities/permission.entity';
import { Role } from '../../../modules/role/entities/role.entity';
import { User } from '../../../modules/user/entities/user.entity';

// 其他实体可以在这里添加
// export { Post } from '../../../modules/post/entities/post.entity';
// export { Category } from '../../../modules/category/entities/category.entity';
// export { Comment } from '../../../modules/comment/entities/comment.entity';

/**
 * 所有实体的数组，用于TypeORM配置
 */
export const entities = [
  User,
  Role,
  Permission,
  Menu,
  // 在这里添加新的实体
];
