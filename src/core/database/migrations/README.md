# 数据库迁移文件目录

此目录用于存放TypeORM数据库迁移文件。

## 迁移文件命名规范

迁移文件应遵循以下命名规范：
- 格式：`{timestamp}-{description}.ts`
- 示例：`1640995200000-CreateUserTable.ts`

## 常用迁移命令

```bash
# 生成迁移文件
npm run migration:generate -- --name=CreateUserTable

# 运行迁移
npm run migration:run

# 回滚迁移
npm run migration:revert

# 显示迁移状态
npm run migration:show
```

## 迁移文件示例

```typescript
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUserTable1640995200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'username',
            type: 'varchar',
            length: '50',
            isUnique: true,
          },
          // 更多列定义...
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
```

## 注意事项

1. 迁移文件一旦创建并运行，不应该修改
2. 如需修改数据库结构，应创建新的迁移文件
3. 生产环境部署前，请确保所有迁移文件都已测试
4. 建议在开发环境中先测试迁移文件的正确性