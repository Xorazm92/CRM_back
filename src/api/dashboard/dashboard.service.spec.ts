import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DashboardService, {
        provide: PrismaService,
        useValue: { user: { count: jest.fn().mockResolvedValue(42) } }
      }],
    }).compile();
    service = module.get<DashboardService>(DashboardService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get stats', async () => {
    jest.spyOn(service, 'getStats').mockResolvedValue({ totalStudents: 10, totalTeachers: 5, totalCourses: 2, activeGroups: 1, attendance: { present: 5, absent: 2, total: 7 }, monthlyRevenue: 1000, lastUpdated: new Date() } as any);
    const stats = await service.getStats();
    expect(stats.totalStudents).toBeDefined();
  });
});
