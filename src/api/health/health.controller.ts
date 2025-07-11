import { Controller, Get, Query, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { Public } from 'src/common/decorator/auth.decorator';
import { SecurityService } from 'src/common/security/security.service';

@ApiTags('Health Check')
@Controller('health')
export class HealthController {
  constructor(
    private readonly healthService: HealthService,
    private readonly securityService: SecurityService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Basic health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  @Public()
  @Get('detailed')
  @ApiOperation({ summary: 'Detailed health check with database status' })
  @ApiQuery({ name: 'key', required: true, description: 'Health check access key' })
  @ApiResponse({ status: 200, description: 'Detailed health information' })
  @ApiResponse({ status: 401, description: 'Invalid access key' })
  async detailedHealthCheck(@Query('key') key: string) {
    if (!this.securityService.isValidHealthCheckKey(key)) {
      throw new UnauthorizedException('Invalid health check key');
    }

    return await this.healthService.getDetailedHealth();
  }

  @Public()
  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe for Kubernetes' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  @ApiResponse({ status: 503, description: 'Service is not ready' })
  async readinessCheck() {
    const isReady = await this.healthService.isReady();
    
    if (!isReady) {
      return {
        status: 'not ready',
        timestamp: new Date().toISOString(),
      };
    }

    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('live')
  @ApiOperation({ summary: 'Liveness probe for Kubernetes' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  async livenessCheck() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      pid: process.pid,
      memory: process.memoryUsage(),
    };
  }
}
