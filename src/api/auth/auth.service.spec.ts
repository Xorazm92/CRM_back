import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CustomJwtService } from '../../infrastructure/lib/custom-jwt.service';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { mockPrismaService, mockUser, createTestModule } from '../../test/test-utils';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// Mock CustomJwtService
const mockCustomJwtService = {
  generateAccessToken: jest.fn(() => Promise.resolve('mock-access-token')),
  generateRefreshToken: jest.fn(() => Promise.resolve('mock-refresh-token')),
};

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let customJwtService: CustomJwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: CustomJwtService,
          useValue: mockCustomJwtService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                ACCESS_TOKEN_TIME: '1h',
                REFRESH_TOKEN_TIME: '7d',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    customJwtService = module.get<CustomJwtService>(CustomJwtService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const loginDto = {
      username: 'testuser',
      password: 'password123',
    };

    it('should login successfully with valid credentials', async () => {
      const userWithPassword = {
        ...mockUser,
        password: 'hashed-password',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(userWithPassword);
      mockedBcrypt.compare = jest.fn().mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).not.toHaveProperty('password');
      expect(customJwtService.generateAccessToken).toHaveBeenCalled();
      expect(customJwtService.generateRefreshToken).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      const userWithPassword = {
        ...mockUser,
        password: 'hashed-password',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(userWithPassword);
      mockedBcrypt.compare = jest.fn().mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('me', () => {
    it('should return user info when user exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.me('test-user-id');

      expect(result.status).toBe(200);
      expect(result.data).toEqual(mockUser);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.me('non-existent-id')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.refreshTokens('test-user-id');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(customJwtService.generateAccessToken).toHaveBeenCalled();
      expect(customJwtService.generateRefreshToken).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.refreshTokens('non-existent-id')).rejects.toThrow(UnauthorizedException);
    });
  });
});