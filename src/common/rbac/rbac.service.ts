import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

export interface UserPermissions {
  userId: string;
  roles: string[];
  permissions: string[];
  level: number;
}

export interface PermissionCheck {
  resource: string;
  action: string;
  userId?: string;
  targetUserId?: string;
}

@Injectable()
export class RbacService {
  private readonly logger = new Logger(RbacService.name);

  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  /**
   * Get user permissions with caching
   */
  async getUserPermissions(userId: string): Promise<UserPermissions> {
    const cacheKey = `rbac:user:${userId}`;
    
    // Try to get from cache first
    const cached = await this.cacheService.get<UserPermissions>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const userWithRoles = await this.prisma.user.findUnique({
      where: { user_id: userId },
      include: {
        user_role_assignments: {
          where: { is_active: true },
          include: {
            role: {
              include: {
                role_permissions: {
                  where: { granted: true },
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!userWithRoles) {
      throw new ForbiddenException('User not found');
    }

    // Extract permissions
    const roles = userWithRoles.user_role_assignments.map(ur => ur.role.name);
    const permissions = new Set<string>();
    let maxLevel = 0;

    userWithRoles.user_role_assignments.forEach(userRoleAssignment => {
      const role = userRoleAssignment.role;
      maxLevel = Math.max(maxLevel, role.level);

      role.role_permissions.forEach(rp => {
        permissions.add(rp.permission.name);
      });
    });

    const userPermissions: UserPermissions = {
      userId,
      roles,
      permissions: Array.from(permissions),
      level: maxLevel,
    };

    // Cache for 5 minutes
    await this.cacheService.set(cacheKey, userPermissions, 300);

    return userPermissions;
  }

  /**
   * Check if user has specific permission
   */
  async hasPermission(userId: string, resource: string, action: string): Promise<boolean> {
    try {
      const userPermissions = await this.getUserPermissions(userId);
      const permissionName = `${resource}:${action}`;
      
      return userPermissions.permissions.includes(permissionName) || 
             userPermissions.permissions.includes(`${resource}:*`) ||
             userPermissions.permissions.includes('*:*');
    } catch (error) {
      this.logger.error(`Permission check failed for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Check if user can access another user's data
   */
  async canAccessUser(currentUserId: string, targetUserId: string): Promise<boolean> {
    // Users can always access their own data
    if (currentUserId === targetUserId) {
      return true;
    }

    const currentUserPermissions = await this.getUserPermissions(currentUserId);
    const targetUserPermissions = await this.getUserPermissions(targetUserId);

    // Higher level users can access lower level users
    return currentUserPermissions.level >= targetUserPermissions.level;
  }

  /**
   * Check multiple permissions at once
   */
  async hasAnyPermission(userId: string, permissions: string[]): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    
    return permissions.some(permission => {
      const [resource, action] = permission.split(':');
      return userPermissions.permissions.includes(permission) ||
             userPermissions.permissions.includes(`${resource}:*`) ||
             userPermissions.permissions.includes('*:*');
    });
  }

  /**
   * Check if user has all required permissions
   */
  async hasAllPermissions(userId: string, permissions: string[]): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    
    return permissions.every(permission => {
      const [resource, action] = permission.split(':');
      return userPermissions.permissions.includes(permission) ||
             userPermissions.permissions.includes(`${resource}:*`) ||
             userPermissions.permissions.includes('*:*');
    });
  }

  /**
   * Grant role to user
   */
  async grantRole(userId: string, roleName: string, grantedBy: string): Promise<void> {
    const role = await this.prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      throw new ForbiddenException(`Role ${roleName} not found`);
    }

    // Check if granter has permission to grant this role
    const granterPermissions = await this.getUserPermissions(grantedBy);
    if (granterPermissions.level < role.level) {
      throw new ForbiddenException('Insufficient permissions to grant this role');
    }

    await this.prisma.userRoleAssignment.upsert({
      where: {
        user_id_role_id: {
          user_id: userId,
          role_id: role.id,
        },
      },
      update: {
        is_active: true,
        granted_by: grantedBy,
        granted_at: new Date(),
      },
      create: {
        user_id: userId,
        role_id: role.id,
        granted_by: grantedBy,
        is_active: true,
      },
    });

    // Clear cache
    await this.clearUserCache(userId);
  }

  /**
   * Revoke role from user
   */
  async revokeRole(userId: string, roleName: string, revokedBy: string): Promise<void> {
    const role = await this.prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      throw new ForbiddenException(`Role ${roleName} not found`);
    }

    // Check if revoker has permission
    const revokerPermissions = await this.getUserPermissions(revokedBy);
    if (revokerPermissions.level < role.level) {
      throw new ForbiddenException('Insufficient permissions to revoke this role');
    }

    await this.prisma.userRoleAssignment.updateMany({
      where: {
        user_id: userId,
        role_id: role.id,
      },
      data: {
        is_active: false,
      },
    });

    // Clear cache
    await this.clearUserCache(userId);
  }

  /**
   * Clear user permissions cache
   */
  async clearUserCache(userId: string): Promise<void> {
    const cacheKey = `rbac:user:${userId}`;
    await this.cacheService.del(cacheKey);
  }

  /**
   * Get all available permissions
   */
  async getAllPermissions(): Promise<any[]> {
    return this.prisma.permission.findMany({
      orderBy: [
        { resource: 'asc' },
        { action: 'asc' },
      ],
    });
  }

  /**
   * Get all roles with their permissions
   */
  async getAllRoles(): Promise<any[]> {
    return this.prisma.role.findMany({
      include: {
        role_permissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: { level: 'desc' },
    });
  }
}
