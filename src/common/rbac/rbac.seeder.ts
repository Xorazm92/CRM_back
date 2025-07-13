import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RbacSeeder {
  private readonly logger = new Logger(RbacSeeder.name);

  constructor(private prisma: PrismaService) {}

  async seed(): Promise<void> {
    this.logger.log('Starting RBAC seeding...');

    await this.seedPermissions();
    await this.seedRoles();
    await this.seedRolePermissions();

    this.logger.log('RBAC seeding completed');
  }

  private async seedPermissions(): Promise<void> {
    this.logger.log('Seeding permissions...');

    const permissions = [
      // User permissions
      { name: 'users:create', resource: 'users', action: 'create', description: 'Create new users' },
      { name: 'users:read', resource: 'users', action: 'read', description: 'View users' },
      { name: 'users:update', resource: 'users', action: 'update', description: 'Update users' },
      { name: 'users:delete', resource: 'users', action: 'delete', description: 'Delete users' },
      { name: 'users:*', resource: 'users', action: '*', description: 'All user permissions' },

      // Course permissions
      { name: 'courses:create', resource: 'courses', action: 'create', description: 'Create courses' },
      { name: 'courses:read', resource: 'courses', action: 'read', description: 'View courses' },
      { name: 'courses:update', resource: 'courses', action: 'update', description: 'Update courses' },
      { name: 'courses:delete', resource: 'courses', action: 'delete', description: 'Delete courses' },
      { name: 'courses:*', resource: 'courses', action: '*', description: 'All course permissions' },

      // Group permissions
      { name: 'groups:create', resource: 'groups', action: 'create', description: 'Create groups' },
      { name: 'groups:read', resource: 'groups', action: 'read', description: 'View groups' },
      { name: 'groups:update', resource: 'groups', action: 'update', description: 'Update groups' },
      { name: 'groups:delete', resource: 'groups', action: 'delete', description: 'Delete groups' },
      { name: 'groups:*', resource: 'groups', action: '*', description: 'All group permissions' },

      // Payment permissions
      { name: 'payments:create', resource: 'payments', action: 'create', description: 'Create payments' },
      { name: 'payments:read', resource: 'payments', action: 'read', description: 'View payments' },
      { name: 'payments:update', resource: 'payments', action: 'update', description: 'Update payments' },
      { name: 'payments:delete', resource: 'payments', action: 'delete', description: 'Delete payments' },
      { name: 'payments:*', resource: 'payments', action: '*', description: 'All payment permissions' },

      // Attendance permissions
      { name: 'attendance:create', resource: 'attendance', action: 'create', description: 'Mark attendance' },
      { name: 'attendance:read', resource: 'attendance', action: 'read', description: 'View attendance' },
      { name: 'attendance:update', resource: 'attendance', action: 'update', description: 'Update attendance' },
      { name: 'attendance:delete', resource: 'attendance', action: 'delete', description: 'Delete attendance' },
      { name: 'attendance:*', resource: 'attendance', action: '*', description: 'All attendance permissions' },

      // Assignment permissions
      { name: 'assignments:create', resource: 'assignments', action: 'create', description: 'Create assignments' },
      { name: 'assignments:read', resource: 'assignments', action: 'read', description: 'View assignments' },
      { name: 'assignments:update', resource: 'assignments', action: 'update', description: 'Update assignments' },
      { name: 'assignments:delete', resource: 'assignments', action: 'delete', description: 'Delete assignments' },
      { name: 'assignments:*', resource: 'assignments', action: '*', description: 'All assignment permissions' },

      // Report permissions
      { name: 'reports:read', resource: 'reports', action: 'read', description: 'View reports' },
      { name: 'reports:create', resource: 'reports', action: 'create', description: 'Generate reports' },
      { name: 'reports:*', resource: 'reports', action: '*', description: 'All report permissions' },

      // Dashboard permissions
      { name: 'dashboard:read', resource: 'dashboard', action: 'read', description: 'View dashboard' },

      // System permissions
      { name: 'system:*', resource: 'system', action: '*', description: 'All system permissions' },
      { name: 'roles:*', resource: 'roles', action: '*', description: 'Manage roles and permissions' },

      // Super admin permission
      { name: '*:*', resource: '*', action: '*', description: 'All permissions (Super Admin)' },
    ];

    for (const permission of permissions) {
      await this.prisma.permission.upsert({
        where: { name: permission.name },
        update: permission,
        create: permission,
      });
    }

    this.logger.log(`Seeded ${permissions.length} permissions`);
  }

  private async seedRoles(): Promise<void> {
    this.logger.log('Seeding roles...');

    const roles = [
      {
        name: 'SUPERADMIN',
        display_name: 'Super Administrator',
        description: 'Full system access',
        level: 5,
        is_system: true,
      },
      {
        name: 'ADMIN',
        display_name: 'Administrator',
        description: 'Administrative access',
        level: 4,
        is_system: true,
      },
      {
        name: 'MANAGER',
        display_name: 'Manager',
        description: 'Management access',
        level: 3,
        is_system: true,
      },
      {
        name: 'TEACHER',
        display_name: 'Teacher',
        description: 'Teaching access',
        level: 2,
        is_system: true,
      },
      {
        name: 'STUDENT',
        display_name: 'Student',
        description: 'Student access',
        level: 1,
        is_system: true,
      },
    ];

    for (const role of roles) {
      await this.prisma.role.upsert({
        where: { name: role.name },
        update: role,
        create: role,
      });
    }

    this.logger.log(`Seeded ${roles.length} roles`);
  }

  private async seedRolePermissions(): Promise<void> {
    this.logger.log('Seeding role permissions...');

    // Get all roles and permissions
    const roles = await this.prisma.role.findMany();
    const permissions = await this.prisma.permission.findMany();

    const rolePermissionMap = {
      SUPERADMIN: ['*:*'],
      ADMIN: [
        'users:*', 'courses:*', 'groups:*', 'payments:*', 
        'attendance:*', 'assignments:*', 'reports:*', 'dashboard:read'
      ],
      MANAGER: [
        'users:read', 'users:update', 'courses:*', 'groups:*', 
        'payments:read', 'payments:update', 'attendance:*', 
        'assignments:read', 'reports:read', 'dashboard:read'
      ],
      TEACHER: [
        'users:read', 'courses:read', 'groups:read', 'groups:update',
        'attendance:*', 'assignments:*', 'reports:read', 'dashboard:read'
      ],
      STUDENT: [
        'courses:read', 'groups:read', 'attendance:read', 
        'assignments:read', 'dashboard:read'
      ],
    };

    for (const role of roles) {
      const permissionNames = rolePermissionMap[role.name] || [];
      
      for (const permissionName of permissionNames) {
        const permission = permissions.find(p => p.name === permissionName);
        if (permission) {
          await this.prisma.rolePermission.upsert({
            where: {
              role_id_permission_id: {
                role_id: role.id,
                permission_id: permission.id,
              },
            },
            update: { granted: true },
            create: {
              role_id: role.id,
              permission_id: permission.id,
              granted: true,
            },
          });
        }
      }
    }

    this.logger.log('Role permissions seeded');
  }
}
