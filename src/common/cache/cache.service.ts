import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: any) {}

  async get<T>(key: string): Promise<T | undefined> {
    try {
      const value = await this.cacheManager.get(key) as T;
      if (value) {
        this.logger.debug(`Cache hit for key: ${key}`);
      } else {
        this.logger.debug(`Cache miss for key: ${key}`);
      }
      return value;
    } catch (error) {
      this.logger.error(`Cache get error for key ${key}:`, error);
      return undefined;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
      this.logger.debug(`Cache set for key: ${key}, TTL: ${ttl || 'default'}`);
    } catch (error) {
      this.logger.error(`Cache set error for key ${key}:`, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.debug(`Cache deleted for key: ${key}`);
    } catch (error) {
      this.logger.error(`Cache delete error for key ${key}:`, error);
    }
  }

  async reset(): Promise<void> {
    try {
      await this.cacheManager.reset();
      this.logger.debug('Cache reset completed');
    } catch (error) {
      this.logger.error('Cache reset error:', error);
    }
  }

  async wrap<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
    try {
      return await this.cacheManager.wrap(key, fn, ttl);
    } catch (error) {
      this.logger.error(`Cache wrap error for key ${key}:`, error);
      // Fallback to direct function call if cache fails
      return await fn();
    }
  }

  // Cache keys generators
  static getUserKey(userId: string): string {
    return `user:${userId}`;
  }

  static getUsersListKey(role?: string, status?: string, search?: string, page?: number, limit?: number): string {
    const params = [role, status, search, page, limit].filter(Boolean).join(':');
    return `users:list:${params}`;
  }

  static getGroupKey(groupId: string): string {
    return `group:${groupId}`;
  }

  static getCourseKey(courseId: string): string {
    return `course:${courseId}`;
  }

  static getDashboardStatsKey(): string {
    return 'dashboard:stats';
  }

  static getAttendanceStatsKey(): string {
    return 'dashboard:attendance';
  }

  static getFinancialStatsKey(): string {
    return 'dashboard:financial';
  }
}
