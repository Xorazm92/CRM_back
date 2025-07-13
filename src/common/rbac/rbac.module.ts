import { Module, Global } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RbacService } from './rbac.service';
import { PermissionGuard } from './guards/permission.guard';
import { ResourceOwnerGuard } from './guards/resource-owner.guard';
import { RoleHierarchyGuard } from './guards/role-hierarchy.guard';
import { PrismaService } from '../prisma/prisma.service';
import { CustomCacheModule } from '../cache/cache.module';

@Global()
@Module({
  imports: [CustomCacheModule],
  providers: [
    RbacService,
    PrismaService,
    PermissionGuard,
    ResourceOwnerGuard,
    RoleHierarchyGuard,
    // Global guards can be added here if needed
    // {
    //   provide: APP_GUARD,
    //   useClass: PermissionGuard,
    // },
  ],
  exports: [
    RbacService,
    PermissionGuard,
    ResourceOwnerGuard,
    RoleHierarchyGuard,
  ],
})
export class RbacModule {}
