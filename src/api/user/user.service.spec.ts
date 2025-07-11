import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { mockPrismaService, mockUser, mockStudent, createTestModule } from '../../test/test-utils';

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await createTestModule([UserService]);
    
    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a user when found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne('test-user-id');

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { user_id: 'test-user-id' },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('filterUsers', () => {
    it('should return filtered users with pagination', async () => {
      const mockUsers = [mockUser, mockStudent];
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);
      mockPrismaService.user.count.mockResolvedValue(2);

      const result = await service.filterUsers('ADMIN', 'ACTIVE', 'test', 1, 10);

      expect(result.data).toEqual(mockUsers);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should handle empty search results', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);
      mockPrismaService.user.count.mockResolvedValue(0);

      const result = await service.filterUsers('STUDENT', 'ACTIVE', 'nonexistent', 1, 10);

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const createUserDto = {
        username: 'newuser',
        password: 'password123',
        name: 'New',
        lastname: 'User',
        role: 'STUDENT' as any,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null); // User doesn't exist
      mockPrismaService.user.create.mockResolvedValue({ ...mockUser, ...createUserDto });

      const result = await service.create(createUserDto);

      expect(result).toBeDefined();
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException when username already exists', async () => {
      const createUserDto = {
        username: 'existinguser',
        password: 'password123',
        name: 'Existing',
        lastname: 'User',
        role: 'STUDENT' as any,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser); // User exists

      await expect(service.create(createUserDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const updateUserDto = {
        name: 'Updated Name',
        lastname: 'Updated Lastname',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({ ...mockUser, ...updateUserDto });

      const result = await service.update('test-user-id', updateUserDto);

      expect(result).toBeDefined();
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { user_id: 'test-user-id' },
        data: updateUserDto,
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.update('non-existent-id', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete user successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      const result = await service.remove('test-user-id');

      expect(result).toBeDefined();
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { user_id: 'test-user-id' },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });
});
