import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Index(['status', 'createdAt'])
@Index(['lastLoginAt'])
@Index(['level', 'points'])
@Entity('users')
export class User {
  @ApiProperty({ description: '用户ID', example: 1 })
  @PrimaryGeneratedColumn({ comment: '用户ID' })
  id: number;

  @ApiProperty({ description: '用户名', example: 'john_doe123', maxLength: 50 })
  @Column({ unique: true, length: 50, comment: '用户名' })
  username: string;

  @ApiProperty({
    description: '用户昵称',
    example: 'John Doe',
    maxLength: 100,
    default: '无名氏',
  })
  @Column({ length: 100, default: '无名氏', comment: '昵称' })
  nickname: string;

  @ApiProperty({
    description: '密码（已加密）',
    example: 'encrypted_password',
    maxLength: 100,
    writeOnly: true,
  })
  @Column({ select: false, length: 100, comment: '密码' })
  password: string;

  @ApiProperty({
    description: '手机号码',
    example: '13812345678',
    required: false,
  })
  @Column({ nullable: true, unique: true, comment: '手机号' })
  phone: string;

  @ApiProperty({ description: '邮箱地址', example: 'john.doe@example.com' })
  @Column({ unique: true, comment: '邮箱' })
  email: string;

  @ApiProperty({
    description: '性别',
    enum: ['男', '女', '保密'],
    example: '男',
    default: '保密',
  })
  @Column({
    type: 'enum',
    enum: ['男', '女', '保密'],
    default: '保密',
    comment: '性别',
  })
  sex: string;

  @ApiProperty({
    description: '生日，格式为YYYY-MM-DD',
    example: '1990-01-01',
    default: '1990-01-01',
  })
  @Column({ default: '1990-01-01', comment: '生日' })
  birth: string;

  @ApiProperty({
    description: '个人签名',
    example: '这是我的个人签名',
    maxLength: 500,
    required: false,
  })
  @Column({ length: 500, nullable: true, comment: '签名' })
  signature: string;

  @ApiProperty({
    description: '头像URL',
    example: 'https://example.com/avatar.jpg',
    maxLength: 255,
    required: false,
  })
  @Column({ length: 255, nullable: true, comment: '头像' })
  avatar: string;

  @ApiProperty({
    description: '用户状态',
    enum: ['active', 'inactive', 'banned'],
    example: 'active',
    default: 'active',
  })
  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'banned'],
    default: 'active',
    comment: '用户状态',
  })
  status: string;

  @ApiProperty({ description: '用户等级', example: 1, minimum: 0, default: 0 })
  @Column({ default: 0, comment: '等级' })
  level: number;

  @ApiProperty({
    description: '用户积分',
    example: 100,
    minimum: 0,
    default: 0,
  })
  @Column({ default: 0, comment: '积分' })
  points: number;

  @ApiProperty({
    description: '最后登录时间',
    example: '2024-01-01T12:00:00Z',
    required: false,
  })
  @Column({ nullable: true, type: 'timestamp', comment: '最后登录时间' })
  lastLoginAt: Date;

  @ApiProperty({
    description: '最后登录IP地址',
    example: '192.168.1.1',
    required: false,
  })
  @Column({ nullable: true, comment: '最后登录IP' })
  lastLoginIp: string;

  @ApiProperty({
    description: '注册IP地址',
    example: '192.168.1.1',
    required: false,
  })
  @Column({ nullable: true, comment: '注册IP' })
  registerIp: string;

  @ApiProperty({ description: '创建时间', example: '2024-01-01T12:00:00Z' })
  @CreateDateColumn({ type: 'timestamp', comment: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间', example: '2024-01-01T12:00:00Z' })
  @UpdateDateColumn({ type: 'timestamp', comment: '更新时间' })
  updatedAt: Date;

  @ApiProperty({
    description: '删除时间（软删除）',
    example: '2024-01-01T12:00:00Z',
    required: false,
  })
  @DeleteDateColumn({
    select: false,
    type: 'timestamp',
    comment: '删除时间(软删除)',
  })
  deletedAt: Date;

  /**
   * 获取用户显示名称
   * @returns {string} 显示名称
   */
  getDisplayName(): string {
    return this.nickname || this.username;
  }

  /**
   * 检查用户是否活跃
   * @returns {boolean} 是否活跃
   */
  isActive(): boolean {
    return this.status === 'active';
  }

  /**
   * 更新最后登录信息
   * @param {string} ip 登录IP
   */
  updateLastLogin(ip?: string): void {
    this.lastLoginAt = new Date();
    if (ip) {
      this.lastLoginIp = ip;
    }
  }

  /**
   * 计算用户年龄
   * @returns {number} 年龄
   */
  getAge(): number {
    const today = new Date();
    const birthDate = new Date(this.birth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
}
