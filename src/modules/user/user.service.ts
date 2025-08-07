import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { compare, hash } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 创建用户
   * @param createUserDto 创建用户数据
   * @param registerIp 注册IP
   * @returns 创建的用户
   */
  async create(createUserDto: CreateUserDto, registerIp?: string): Promise<User> {
    // 检查用户名是否已存在
    const existingUser = await this.userRepository.findOne({
      where: [{ username: createUserDto.username }, { email: createUserDto.email }],
    });

    if (existingUser) {
      throw new ConflictException('用户名或邮箱已存在');
    }

    if (!createUserDto.password || typeof createUserDto.password !== 'string') {
      throw new Error('密码不能为空且必须是字符串类型');
    }
    const password: string = createUserDto.password;
    const saltRounds = this.configService.get<number>('app.security.bcryptSaltRounds') || 10;
    const hashedPassword: string = await hash(password, saltRounds);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      registerIp,
    });

    const savedUser = await this.userRepository.save(user);

    // 重新查询用户以确保敏感字段被过滤
    return (await this.userRepository.findOne({
      where: { id: savedUser.id },
    })) as User;
  }

  /**
   * 查找所有用户
   * @param page 页码
   * @param limit 每页数量
   * @param status 用户状态筛选
   * @returns 用户列表和总数
   */
  async findAll(
    page: number = this.configService.get<number>('app.pagination.defaultPage') || 1,
    limit: number = this.configService.get<number>('app.pagination.defaultLimit') || 10,
    status?: 'active' | 'inactive' | 'banned',
  ) {
    const whereCondition = status ? { status } : {};

    const [users, total] = await this.userRepository.findAndCount({
      where: whereCondition,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 根据ID查找用户
   * @param id 用户ID
   * @returns 用户信息
   */
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  /**
   * 根据用户名查找用户
   * @param username 用户名
   * @returns 用户信息
   */
  async findByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { username },
      select: [
        'id',
        'username',
        'nickname',
        'password',
        'phone',
        'email',
        'sex',
        'birth',
        'signature',
        'avatar',
        'status',
        'level',
        'points',
        'lastLoginAt',
        'lastLoginIp',
        'registerIp',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  /**
   * 根据邮箱查找用户
   * @param email 邮箱
   * @returns 用户信息
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      select: [
        'id',
        'username',
        'nickname',
        'password',
        'phone',
        'email',
        'sex',
        'birth',
        'signature',
        'avatar',
        'status',
        'level',
        'points',
        'lastLoginAt',
        'lastLoginIp',
        'registerIp',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  /**
   * 根据手机号查找用户
   * @param phone 手机号
   * @returns 用户信息
   */
  async findByPhone(phone: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { phone },
      select: [
        'id',
        'username',
        'nickname',
        'password',
        'phone',
        'email',
        'sex',
        'birth',
        'signature',
        'avatar',
        'status',
        'level',
        'points',
        'lastLoginAt',
        'lastLoginIp',
        'registerIp',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  /**
   * 更新用户信息
   * @param id 用户ID
   * @param updateUserDto 更新数据
   * @returns 更新后的用户
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.password) {
      updateUserDto.password = await hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);
    await this.userRepository.save(user);

    // 重新查询用户以确保敏感字段被过滤
    return (await this.userRepository.findOne({
      where: { id },
    })) as User;
  }

  /**
   * 软删除用户
   * @param id 用户ID
   */
  async remove(id: number): Promise<void> {
    await this.userRepository.softDelete(id);
  }

  /**
   * 验证用户密码
   * @param password 明文密码
   * @param hashedPassword 加密密码
   * @returns 是否匹配
   */
  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await compare(password, hashedPassword);
  }

  /**
   * 更新用户最后登录信息
   * @param id 用户ID
   * @param ip 登录IP
   */
  async updateLastLogin(id: number, ip?: string): Promise<void> {
    const user = await this.findOne(id);
    user.updateLastLogin(ip);
    await this.userRepository.save(user);
  }

  /**
   * 更新用户状态
   * @param id 用户ID
   * @param status 新状态
   */
  async updateStatus(id: number, status: 'active' | 'inactive' | 'banned'): Promise<User> {
    const user = await this.findOne(id);
    user.status = status;
    await this.userRepository.save(user);

    // 重新查询用户以确保敏感字段被过滤
    return (await this.userRepository.findOne({
      where: { id },
    })) as User;
  }

  /**
   * 增加用户积分
   * @param id 用户ID
   * @param points 积分数量
   */
  async addPoints(id: number, points: number): Promise<User> {
    const user = await this.findOne(id);
    user.points += points;

    // 根据积分计算等级（示例逻辑）
    user.level = Math.floor(user.points / 100);

    await this.userRepository.save(user);

    // 重新查询用户以确保敏感字段被过滤
    return (await this.userRepository.findOne({
      where: { id },
    })) as User;
  }

  /**
   * 扣除用户积分
   * @param id 用户ID
   * @param points 积分数量
   */
  async deductPoints(id: number, points: number): Promise<User> {
    const user = await this.findOne(id);
    user.points = Math.max(0, user.points - points);

    // 重新计算等级
    user.level = Math.floor(user.points / 100);

    await this.userRepository.save(user);

    // 重新查询用户以确保敏感字段被过滤
    return (await this.userRepository.findOne({
      where: { id },
    })) as User;
  }

  /**
   * 获取活跃用户列表
   * @param limit 数量限制
   * @returns 活跃用户列表
   */
  async getActiveUsers(limit: number = this.configService.get<number>('app.user.activeUserLimit') || 10): Promise<User[]> {
    return await this.userRepository.find({
      where: { status: 'active' },
      order: { lastLoginAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * 获取用户统计信息
   * @returns 统计数据
   */
  async getUserStats() {
    const total = await this.userRepository.count();
    const active = await this.userRepository.count({
      where: { status: 'active' },
    });
    const inactive = await this.userRepository.count({
      where: { status: 'inactive' },
    });
    const banned = await this.userRepository.count({
      where: { status: 'banned' },
    });

    return {
      total,
      active,
      inactive,
      banned,
    };
  }

  /**
   * 搜索用户
   * @param keyword 关键词
   * @param page 页码
   * @param limit 每页数量
   * @returns 搜索结果
   */
  async searchUsers(
    keyword: string,
    page: number = this.configService.get<number>('app.pagination.defaultPage') || 1,
    limit: number = this.configService.get<number>('app.pagination.defaultLimit') || 10,
  ) {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    queryBuilder
      .where('user.username LIKE :keyword', { keyword: `%${keyword}%` })
      .orWhere('user.nickname LIKE :keyword', { keyword: `%${keyword}%` })
      .orWhere('user.email LIKE :keyword', { keyword: `%${keyword}%` })
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('user.createdAt', 'DESC');

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 批量更新用户状态
   * @param ids 用户ID数组
   * @param status 新状态
   */
  async batchUpdateStatus(ids: number[], status: 'active' | 'inactive' | 'banned'): Promise<void> {
    await this.userRepository.update(ids, { status });
  }

  /**
   * 检查用户是否存在
   * @param conditions 查询条件
   * @returns 是否存在
   */
  async exists(conditions: FindOptionsWhere<User>): Promise<boolean> {
    const count = await this.userRepository.count({ where: conditions });
    return count > 0;
  }
}
