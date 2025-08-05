import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

@Index(['status', 'createdAt'])
@Index(['lastLoginAt'])
@Index(['level', 'points'])
@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ comment: '用户ID' })
  id: number;

  @Column({ unique: true, length: 50, comment: '用户名' })
  username: string;

  @Column({ length: 100, default: '无名氏', comment: '昵称' })
  nickname: string;

  @Column({ select: false, length: 100, comment: '密码' })
  password: string;

  @Column({ nullable: true, unique: true, comment: '手机号' })
  phone: string;

  @Column({ unique: true, comment: '邮箱' })
  email: string;

  @Column({
    type: 'enum',
    enum: ['男', '女', '保密'],
    default: '保密',
    comment: '性别',
  })
  sex: string;

  @Column({ default: '1990-01-01', comment: '生日' })
  birth: string;

  @Column({ length: 500, nullable: true, comment: '签名' })
  signature: string;

  @Column({ length: 255, nullable: true, comment: '头像' })
  avatar: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'banned'],
    default: 'active',
    comment: '用户状态',
  })
  status: string;

  @Column({ default: 0, comment: '等级' })
  level: number;

  @Column({ default: 0, comment: '积分' })
  points: number;

  @Column({ nullable: true, type: 'timestamp', comment: '最后登录时间' })
  lastLoginAt: Date;

  @Column({ nullable: true, comment: '最后登录IP' })
  lastLoginIp: string;

  @Column({ nullable: true, comment: '注册IP' })
  registerIp: string;

  @CreateDateColumn({ type: 'timestamp', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', comment: '更新时间' })
  updatedAt: Date;

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
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }
}
