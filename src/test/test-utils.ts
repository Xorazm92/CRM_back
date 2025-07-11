import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma/prisma.service';
import { SecurityService } from '../common/security/security.service';

// Mock PrismaService
export const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  groups: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  course: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  attendance: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    groupBy: jest.fn(),
  },
  studentPayment: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  $queryRaw: jest.fn(),
  $transaction: jest.fn(),
};

// Mock ConfigService
export const mockConfigService = {
  get: jest.fn((key: string, defaultValue?: any) => {
    const config = {
      JWT_SECRET: 'test-jwt-secret',
      ACCESS_TOKEN_KEY: 'test-access-token-key',
      REFRESH_TOKEN_KEY: 'test-refresh-token-key',
      ACCESS_TOKEN_TIME: '1h',
      REFRESH_TOKEN_TIME: '7d',
      BCRYPT_ROUNDS: '10',
      CORS_ORIGIN: 'http://localhost:3000',
      RATE_LIMIT_TTL: '60',
      RATE_LIMIT_LIMIT: '100',
      HEALTH_CHECK_KEY: 'test-health-key',
    };
    return config[key] || defaultValue;
  }),
};

// Mock JwtService
export const mockJwtService = {
  sign: jest.fn(() => 'mock-jwt-token'),
  verify: jest.fn(() => ({ id: 'test-user-id', role: 'ADMIN' })),
  verifyAsync: jest.fn(() => Promise.resolve({ id: 'test-user-id', role: 'ADMIN' })),
};

// Mock SecurityService
export const mockSecurityService = {
  hashPassword: jest.fn(() => Promise.resolve('hashed-password')),
  comparePassword: jest.fn(() => Promise.resolve(true)),
  getSecurityConfig: jest.fn(() => ({
    corsOrigins: ['http://localhost:3000'],
    rateLimitTtl: 60,
    rateLimitLimit: 100,
    bcryptRounds: 10,
    jwtSecret: 'test-jwt-secret',
    accessTokenKey: 'test-access-token-key',
    refreshTokenKey: 'test-refresh-token-key',
    accessTokenTime: '1h',
    refreshTokenTime: '7d',
    healthCheckKey: 'test-health-key',
  })),
  isValidHealthCheckKey: jest.fn(() => true),
};

// Test user data
export const mockUser = {
  user_id: 'test-user-id',
  username: 'testuser',
  email: 'test@example.com',
  name: 'Test',
  lastname: 'User',
  role: 'ADMIN',
  status: 'ACTIVE',
  created_at: new Date(),
  updated_at: new Date(),
};

export const mockStudent = {
  ...mockUser,
  user_id: 'test-student-id',
  username: 'teststudent',
  role: 'STUDENT',
};

export const mockTeacher = {
  ...mockUser,
  user_id: 'test-teacher-id',
  username: 'testteacher',
  role: 'TEACHER',
};

// Test course data
export const mockCourse = {
  course_id: 'test-course-id',
  name: 'Test Course',
  description: 'Test course description',
  duration: 30,
  price: 100,
  status: 'ACTIVE',
  created_at: new Date(),
  updated_at: new Date(),
};

// Test group data
export const mockGroup = {
  group_id: 'test-group-id',
  name: 'Test Group',
  description: 'Test group description',
  course_id: 'test-course-id',
  status: 'ACTIVE',
  created_at: new Date(),
  updated_at: new Date(),
};

// Helper function to create test module
export async function createTestModule(providers: any[]): Promise<TestingModule> {
  return await Test.createTestingModule({
    providers: [
      ...providers,
      {
        provide: PrismaService,
        useValue: mockPrismaService,
      },
      {
        provide: ConfigService,
        useValue: mockConfigService,
      },
      {
        provide: JwtService,
        useValue: mockJwtService,
      },
      {
        provide: SecurityService,
        useValue: mockSecurityService,
      },
    ],
  }).compile();
}
