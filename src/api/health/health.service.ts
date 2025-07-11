import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private prisma: PrismaService) {}

  async getDetailedHealth() {
    const startTime = Date.now();
    
    try {
      const [dbStatus, systemInfo] = await Promise.all([
        this.checkDatabaseHealth(),
        this.getSystemInfo(),
      ]);

      const responseTime = Date.now() - startTime;

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        services: {
          database: dbStatus,
        },
        system: systemInfo,
      };
    } catch (error) {
      this.logger.error('Health check failed', error.stack);
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  async isReady(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.warn('Readiness check failed', error.message);
      return false;
    }
  }

  private async checkDatabaseHealth() {
    const startTime = Date.now();
    
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        responseTime: `${responseTime}ms`,
      };
    } catch (error) {
      this.logger.error('Database health check failed', error.stack);
      return {
        status: 'unhealthy',
        error: error.message,
      };
    }
  }

  private getSystemInfo() {
    return {
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch,
      uptime: `${Math.floor(process.uptime())}s`,
      memory: {
        used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
      },
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
