import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RbacService } from '../rbac.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RESOURCE_OWNER_KEY } from '../decorators/resource-owner.decorator';

export interface ResourceOwnerConfig {
  resource: string;
  idParam: string;
  ownerField: string;
  allowSelf?: boolean;
}

@Injectable()
export class ResourceOwnerGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rbacService: RbacService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const config = this.reflector.getAllAndOverride<ResourceOwnerConfig>(
      RESOURCE_OWNER_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!config) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resourceId = request.params[config.idParam];

    if (!user || !user.user_id) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!resourceId) {
      throw new ForbiddenException('Resource ID not provided');
    }

    // Check if user is accessing their own resource
    if (config.allowSelf && resourceId === user.user_id) {
      return true;
    }

    // Get resource owner
    const resource = await this.getResourceOwner(config.resource, resourceId, config.ownerField);
    
    if (!resource) {
      throw new ForbiddenException('Resource not found');
    }

    const ownerId = resource[config.ownerField];

    // Check if user is the owner
    if (ownerId === user.user_id) {
      return true;
    }

    // Check if user can access other users' resources
    const canAccess = await this.rbacService.canAccessUser(user.user_id, ownerId);
    
    if (!canAccess) {
      throw new ForbiddenException('Access denied to this resource');
    }

    return true;
  }

  private async getResourceOwner(resource: string, id: string, ownerField: string): Promise<any> {
    const model = this.prisma[resource];
    
    if (!model) {
      throw new ForbiddenException(`Invalid resource: ${resource}`);
    }

    return model.findUnique({
      where: { [this.getIdField(resource)]: id },
      select: { [ownerField]: true },
    });
  }

  private getIdField(resource: string): string {
    // Map resource names to their ID fields
    const idFieldMap: Record<string, string> = {
      user: 'user_id',
      groups: 'group_id',
      course: 'course_id',
      lessons: 'lesson_id',
      attendance: 'attendance_id',
      studentPayment: 'payment_id',
      assignments: 'assignment_id',
      submissions: 'submission_id',
    };

    return idFieldMap[resource] || 'id';
  }
}
