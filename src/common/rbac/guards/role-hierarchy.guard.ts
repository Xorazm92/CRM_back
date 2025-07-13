import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RbacService } from '../rbac.service';
import { MIN_ROLE_LEVEL_KEY } from '../decorators/min-role-level.decorator';

@Injectable()
export class RoleHierarchyGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rbacService: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const minLevel = this.reflector.getAllAndOverride<number>(
      MIN_ROLE_LEVEL_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (minLevel === undefined) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.user_id) {
      throw new ForbiddenException('User not authenticated');
    }

    const userPermissions = await this.rbacService.getUserPermissions(user.user_id);

    if (userPermissions.level < minLevel) {
      throw new ForbiddenException(
        `Access denied. Minimum role level required: ${minLevel}, your level: ${userPermissions.level}`,
      );
    }

    return true;
  }
}
