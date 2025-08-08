# Forum Service 项目开发规范

## 项目概述

这是一个基于 NestJS 框架的论坛服务后端项目，采用 TypeScript 开发，使用 MySQL 数据库和 Redis 缓存。项目具有完整的用户认证、角色权限管理、动态权限控制等功能。

## 技术栈

- **框架**: NestJS 11.x
- **语言**: TypeScript 5.x
- **数据库**: MySQL (TypeORM)
- **缓存**: Redis (ioredis)
- **认证**: JWT + Passport
- **文档**: Swagger/OpenAPI
- **包管理**: pnpm
- **代码规范**: ESLint + Prettier

## 项目架构规范

### 1. 目录结构规范

```
src/
├── app.module.ts          # 应用主模块
├── main.ts               # 应用入口
├── common/               # 通用模块
│   ├── constants.ts      # 常量定义
│   ├── decorators/       # 自定义装饰器
│   ├── dto/             # 通用DTO
│   ├── filters/         # 异常过滤器
│   ├── guards/          # 守卫
│   ├── interceptors/    # 拦截器
│   ├── middleware/      # 中间件
│   ├── pipes/           # 管道
│   ├── services/        # 通用服务
│   └── utils/           # 工具函数
├── config/              # 配置文件
├── core/                # 核心模块
│   ├── database/        # 数据库配置
│   └── cache/           # 缓存配置
└── modules/             # 业务模块
    ├── auth/            # 认证模块
    ├── user/            # 用户模块
    ├── role/            # 角色模块
    ├── permission/      # 权限模块
    └── menu/            # 菜单模块
```

### 2. 模块组织规范

每个业务模块应包含以下文件结构：
```
module-name/
├── module-name.module.ts     # 模块定义
├── module-name.controller.ts # 控制器
├── module-name.service.ts    # 服务层
├── entities/                 # 实体定义
│   └── module-name.entity.ts
├── dto/                      # 数据传输对象
│   ├── create-module-name.dto.ts
│   ├── update-module-name.dto.ts
│   └── query-module-name.dto.ts
├── guards/                   # 模块特定守卫
└── strategies/               # 认证策略（如适用）
```

## 编码规范

### 1. TypeScript 规范

- **严格模式**: 启用 TypeScript 严格模式
- **类型定义**: 所有函数参数和返回值必须明确类型
- **接口优先**: 优先使用 interface 而非 type
- **枚举使用**: 使用 const enum 提高性能

```typescript
// ✅ 正确示例
interface CreateUserDto {
  username: string;
  email: string;
  password: string;
}

async function createUser(dto: CreateUserDto): Promise<User> {
  // 实现
}

// ❌ 错误示例
function createUser(dto: any): any {
  // 实现
}
```

### 2. NestJS 规范

#### 装饰器使用
- 控制器使用 `@Controller()` 装饰器
- 服务使用 `@Injectable()` 装饰器
- 模块使用 `@Module()` 装饰器
- API 文档使用 `@ApiProperty()` 等 Swagger 装饰器

#### 依赖注入
- 构造函数注入优于属性注入
- 使用 `private readonly` 修饰注入的依赖

```typescript
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly redisService: RedisService,
  ) {}
}
```

### 3. 数据库规范

#### 实体定义
- 使用 TypeORM 装饰器定义实体
- 必须包含主键、创建时间、更新时间
- 软删除使用 `@DeleteDateColumn()`
- 添加适当的索引 `@Index()`

```typescript
@Entity('users')
@Index(['status', 'createdAt'])
export class User {
  @PrimaryGeneratedColumn({ comment: '用户ID' })
  id: number;

  @Column({ unique: true, length: 50, comment: '用户名' })
  username: string;

  @CreateDateColumn({ type: 'timestamp', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', comment: '更新时间' })
  updatedAt: Date;

  @DeleteDateColumn({ select: false, type: 'timestamp', comment: '删除时间' })
  deletedAt: Date;
}
```

#### 关系定义
- 使用 `@ManyToMany`、`@OneToMany`、`@ManyToOne` 等装饰器
- 明确指定 `cascade` 和 `eager` 选项
- 使用 `@JoinTable` 和 `@JoinColumn` 指定关联表

### 4. 权限系统规范

#### 动态权限装饰器
项目实现了动态权限系统，必须正确使用权限装饰器：

```typescript
// 基本权限检查
@DynamicPermission({ code: 'user:read' })
@Get()
async getUsers() {}

// 模块+操作权限
@DynamicPermission({ module: 'user', action: 'create' })
@Post()
async createUser() {}

// 资源级权限
@DynamicResourcePermission('update', 'id')
@Put(':id')
async updateUser(@Param('id') id: string) {}

// 多权限组合
@DynamicPermissions([
  { code: 'user:read' },
  { code: 'user:manage' }
], 'AND')
@Get('manage')
async manageUsers() {}
```

#### 权限命名规范
- 格式：`模块:操作`
- 操作类型：`create`、`read`、`update`、`delete`、`manage`
- 示例：`user:create`、`role:manage`、`permission:read`

### 5. API 设计规范

#### RESTful API
- 使用标准 HTTP 方法：GET、POST、PUT、PATCH、DELETE
- 路由命名使用复数形式：`/users`、`/roles`
- 使用适当的 HTTP 状态码

#### 响应格式
项目使用统一的响应拦截器 `ResponseInterceptor`，所有 API 响应格式为：
```typescript
{
  code: number;        // 状态码
  message: string;     // 消息
  data: any;          // 数据
  timestamp: number;   // 时间戳
}
```

**响应拦截器实现**：
- 位置：`src/common/interceptors/response.interceptor.ts`
- DTO定义：`src/common/dto/response.dto.ts`
- 自动包装所有控制器返回的数据为统一格式
- 支持 `ResponseDto.success()` 和 `ResponseDto.error()` 静态方法

**ResponseDto 使用规范**：

1. **使用方式**：
```typescript
// ✅ 推荐：手动使用 ResponseDto.success() 包装
@Post()
async create(@Body() createUserDto: CreateUserDto) {
  const user = await this.userService.create(createUserDto);
  return ResponseDto.success(user, '用户创建成功');
}

// ✅ 分页数据包装
@Get()
async findAll(@Query() queryDto: QueryUserDto) {
  const result = await this.userService.findAll(page, limit, status);
  const paginationData = new PaginationDto(result.users, result.total, page, limit);
  return ResponseDto.success(paginationData, '获取用户列表成功');
}
```

#### Swagger 文档
- 所有 API 必须添加 Swagger 注解
- 使用 `@ApiOperation()` 描述接口功能
- 使用 `@ApiResponse()` 描述响应
- DTO 类使用 `@ApiProperty()` 描述字段

```typescript
@ApiOperation({ summary: '创建用户', description: '创建新用户账户' })
@ApiResponse({ status: 201, description: '创建成功', type: User })
@ApiResponse({ status: 400, description: '请求参数错误' })
@Post()
async create(@Body() createUserDto: CreateUserDto): Promise<User> {
  return this.userService.create(createUserDto);
}
```

### 6. 错误处理规范

#### 异常类型
- 使用 NestJS 内置异常类：`BadRequestException`、`UnauthorizedException` 等
- 自定义异常继承自 `HttpException`
- 提供有意义的错误消息

```typescript
// ✅ 正确示例
if (!user) {
  throw new NotFoundException('用户不存在');
}

if (user.status !== 'active') {
  throw new UnauthorizedException('账户已被禁用，请联系管理员');
}
```

#### 全局异常过滤器
项目已配置全局异常过滤器 `HttpExceptionFilter`，统一处理异常响应。

### 7. 缓存使用规范

#### Redis 服务
项目提供了 `RedisService`，包含以下功能：
- Token 黑名单管理
- 用户会话管理
- 刷新 Token 存储

```typescript
// Token 黑名单
await this.redisService.blacklistToken(token, expiresIn);
const isBlacklisted = await this.redisService.isTokenBlacklisted(token);

// 用户会话
await this.redisService.storeUserSession(userId, accessToken, expiresIn);
const session = await this.redisService.getUserSession(userId);
```

### 8. 配置管理规范

#### 环境变量
- 所有配置通过环境变量管理
- 提供 `.env.example` 文件作为模板
- 敏感信息（密码、密钥）不得硬编码

#### 配置文件
- 使用 `@nestjs/config` 模块
- 配置文件放在 `src/config/` 目录
- 使用 `registerAs` 创建命名空间配置

```typescript
export default registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  globalPrefix: process.env.API_PREFIX || 'api',
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
}));
```

## 安全规范

### 1. 认证授权
- 使用 JWT 进行身份认证
- 实现访问 Token 和刷新 Token 机制
- Token 过期后自动加入黑名单
- 支持单点登录（强制下线其他设备）

### 2. 密码安全
- 使用 bcrypt 加密密码
- 盐值轮数不少于 10
- 密码字段设置 `select: false`

### 3. 权限控制
- 实现基于角色的访问控制（RBAC）
- 支持动态权限检查
- 资源级权限控制
- 权限状态实时验证

### 4. 输入验证
- 使用 `class-validator` 进行数据验证
- 启用 `whitelist` 过滤未知属性
- 启用 `forbidNonWhitelisted` 拒绝未知属性

## 部署规范

### 1. 环境配置
- 开发环境：`NODE_ENV=development`
- 生产环境：`NODE_ENV=production`
- 生产环境禁用数据库同步：`synchronize: false`

### 2. 构建部署
- 使用 `pnpm run build` 构建项目
- 使用 `pnpm run start:prod` 启动生产服务
- 配置 PM2 或 Docker 进行进程管理

## 代码质量规范

### 1. 代码格式化
- 使用 Prettier 格式化代码
- 配置：单引号、行宽 200、尾随逗号

### 2. 代码检查
- 使用 ESLint 进行代码检查
- 禁用 `@typescript-eslint/no-explicit-any`（项目特殊需求）
- 警告级别：`@typescript-eslint/no-floating-promises`

### 3. Git 提交规范
- 使用语义化提交信息
- 格式：`type(scope): description`
- 类型：feat、fix、docs、style、refactor、test、chore

## 性能优化规范

### 1. 数据库优化
- 合理使用索引
- 避免 N+1 查询问题
- 使用分页查询大数据集
- 适当使用 `eager` 和 `lazy` 加载

### 2. 缓存策略
- 热点数据使用 Redis 缓存
- 设置合理的过期时间
- 缓存穿透和雪崩防护

### 3. 内存管理
- 及时释放不需要的对象引用
- 避免内存泄漏
- 监控内存使用情况

## 监控日志规范

### 1. 日志记录
- 使用 NestJS 内置 Logger
- 记录关键操作和错误信息
- 生产环境避免记录敏感信息

### 2. 错误监控
- 记录异常堆栈信息
- 监控 API 响应时间
- 设置告警机制

## 文档规范

### 1. API 文档
- 使用 Swagger 自动生成 API 文档
- 访问路径：`/swagger`
- 保持文档与代码同步

### 2. 代码注释
- 复杂业务逻辑必须添加注释
- 使用 JSDoc 格式注释
- 注释使用中文

### 3. README 文档
- 包含项目介绍、安装、运行说明
- 提供环境配置示例
- 更新部署说明

## 项目特殊规范

### 1. 权限装饰器使用规范

#### 动态权限装饰器（推荐使用）
项目实现了 `@DynamicPermission` 装饰器，支持实时权限检查：

```typescript
// ✅ 正确使用动态权限装饰器
@DynamicPermission({ code: 'user:read' })
@Get()
async getUsers() {}

@DynamicPermission({ code: 'user:create' })
@Post()
async createUser() {}

@DynamicPermission({ code: 'user:update' })
@Put(':id')
async updateUser() {}

@DynamicPermission({ code: 'user:delete' })
@Delete(':id')
async deleteUser() {}
```

**标准权限配置模板**：
```typescript
// 用户管理模块权限配置
@DynamicPermission({ code: 'user:create' })  // 创建用户
@DynamicPermission({ code: 'user:read' })    // 查看用户
@DynamicPermission({ code: 'user:update' })  // 更新用户
@DynamicPermission({ code: 'user:delete' })  // 删除用户
@DynamicPermission({ code: 'user:manage' })  // 管理用户（批量操作）

// 权限管理模块权限配置
@DynamicPermission({ code: 'permission:create' })
@DynamicPermission({ code: 'permission:read' })
@DynamicPermission({ code: 'permission:update' })
@DynamicPermission({ code: 'permission:delete' })
@DynamicPermission({ code: 'permission:manage' })

// 角色管理模块权限配置
@DynamicPermission({ code: 'role:create' })
@DynamicPermission({ code: 'role:read' })
@DynamicPermission({ code: 'role:update' })
@DynamicPermission({ code: 'role:delete' })
@DynamicPermission({ code: 'role:manage' })
```

### 2. 控制器安全规范

#### 必须添加权限控制的接口
所有管理类接口都必须添加适当的权限装饰器：

```typescript
// ❌ 错误：缺少权限控制
@Post()
async create(@Body() dto: CreateUserDto) {}

// ✅ 正确：添加权限控制
@Post()
@DynamicPermission({ code: 'user:create' })
async create(@Body() dto: CreateUserDto) {}
```

#### 公开接口标识
对于不需要权限的公开接口，应明确标识：

```typescript
// 公开接口示例
@Get('check/username/:username')
@ApiOperation({ summary: '检查用户名', description: '公开接口：检查用户名是否已存在' })
async checkUsername(@Param('username') username: string) {}
```

### 3. 权限系统最佳实践

#### 权限粒度设计
- **模块级权限**：`user:read`、`role:manage`
- **操作级权限**：`user:create`、`user:update`、`user:delete`
- **资源级权限**：`user:update:self`（用户只能修改自己的信息）
- **管理级权限**：`user:manage`（包含所有用户操作）

#### 权限继承关系
```
super_admin (超级管理员)
├── admin (管理员)
│   ├── user:manage (用户管理)
│   ├── role:manage (角色管理)
│   └── permission:manage (权限管理)
├── moderator (版主)
│   ├── user:read (查看用户)
│   └── user:update (更新用户状态)
└── user (普通用户)
    ├── user:read:self (查看自己信息)
    └── user:update:self (更新自己信息)
```

## 代码质量检查清单

### 新功能开发检查项
- [ ] 控制器方法是否添加了适当的权限装饰器
- [ ] 权限代码是否遵循命名规范（模块:操作）
- [ ] 是否添加了完整的 Swagger 文档注解
- [ ] 是否实现了适当的错误处理
- [ ] 是否添加了输入验证（DTO + class-validator）
- [ ] 是否考虑了缓存一致性问题
- [ ] 是否编写了单元测试

### 权限系统检查项
- [ ] 新增权限是否在数据库中正确配置
- [ ] 权限是否分配给了适当的角色
- [ ] 是否测试了权限验证逻辑
- [ ] 是否考虑了超级管理员的特殊处理
- [ ] 是否处理了用户状态变更对权限的影响

## 注意事项

1. **权限系统**: 项目实现了复杂的动态权限系统，开发时必须正确使用权限装饰器
3. **缓存一致性**: 修改用户、角色、权限数据时，注意清理相关缓存
4. **数据库迁移**: 生产环境数据库变更必须通过迁移文件进行
5. **安全性**: 所有用户输入必须验证，防止 SQL 注入和 XSS 攻击
6. **性能**: 注意查询性能，避免全表扫描和深度关联查询
7. **权限一致性**: 确保所有管理接口都有适当的权限控制

---

遵循以上规范，确保代码质量、安全性和可维护性。如有疑问，请参考项目现有代码实现。