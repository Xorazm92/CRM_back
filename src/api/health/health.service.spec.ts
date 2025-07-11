import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { mockPrismaService, createTestModule } from '../../test/test-utils';

describe('HealthService', () => {
  let service: HealthService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await createTestModule([HealthService]);
    
    service = module.get<HealthService>(HealthService);
    prisma = module.get<PrismaService>(PrismaService);
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('isReady', () => {
    it('should return true when database is accessible', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      const result = await service.isReady();

      expect(result).toBe(true);
      expect(prisma.$queryRaw).toHaveBeenCalled();
    });

    it('should return false when database is not accessible', async () => {
      mockPrismaService.$queryRaw.mockRejectedValue(new Error('Database connection failed'));

      const result = await service.isReady();

      expect(result).toBe(false);
    });
  });

  describe('getDetailedHealth', () => {
    it('should return detailed health information when all services are healthy', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      const result = await service.getDetailedHealth();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('responseTime');
      expect(result).toHaveProperty('services');
      expect(result).toHaveProperty('system');
      expect(result.services).toHaveProperty('database');
      expect(result.services.database).toHaveProperty('status', 'healthy');
    });

    it('should return error status when database check fails', async () => {
      // Mock the database to fail on the first call (for checkDatabaseHealth)
      // but succeed on the second call (for isReady check in getDetailedHealth)
      mockPrismaService.$queryRaw
        .mockRejectedValueOnce(new Error('Database error'))
        .mockResolvedValueOnce([{ '?column?': 1 }]);

      const result = await service.getDetailedHealth();

      expect(result).toHaveProperty('status', 'ok');
      expect(result.services.database).toHaveProperty('status', 'unhealthy');
      expect(result.services.database).toHaveProperty('error', 'Database error');
    });

    it('should include system information in detailed health check', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      const result = await service.getDetailedHealth();

      expect(result.system).toHaveProperty('nodeVersion');
      expect(result.system).toHaveProperty('platform');
      expect(result.system).toHaveProperty('architecture');
      expect(result.system).toHaveProperty('uptime');
      expect(result.system).toHaveProperty('memory');
      expect(result.system).toHaveProperty('environment');
    });
  });
});
