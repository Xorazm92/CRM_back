import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RbacService } from '../../common/rbac/rbac.service';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/rbac/guards/permission.guard';
import { RequirePermissions, SuperAdminOnly } from '../../common/rbac/decorators/permissions.decorator';
import { GrantRoleDto, RevokeRoleDto } from './dto/rbac.dto';

@ApiTags('RBAC')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('rbac')
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get('permissions')
  @RequirePermissions('roles:read')
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiResponse({ status: 200, description: 'List of all permissions' })
  async getAllPermissions() {
    return this.rbacService.getAllPermissions();
  }

  @Get('roles')
  @RequirePermissions('roles:read')
  @ApiOperation({ summary: 'Get all roles with permissions' })
  @ApiResponse({ status: 200, description: 'List of all roles with their permissions' })
  async getAllRoles() {
    return this.rbacService.getAllRoles();
  }

  @Get('user/:userId/permissions')
  @RequirePermissions('users:read')
  @ApiOperation({ summary: 'Get user permissions' })
  @ApiResponse({ status: 200, description: 'User permissions and roles' })
  async getUserPermissions(@Param('userId') userId: string) {
    return this.rbacService.getUserPermissions(userId);
  }

  @Get('my-permissions')
  @ApiOperation({ summary: 'Get current user permissions' })
  @ApiResponse({ status: 200, description: 'Current user permissions and roles' })
  async getMyPermissions(@Request() req) {
    return this.rbacService.getUserPermissions(req.user.user_id);
  }

  @Post('grant-role')
  @SuperAdminOnly()
  @ApiOperation({ summary: 'Grant role to user' })
  @ApiResponse({ status: 200, description: 'Role granted successfully' })
  async grantRole(@Body() grantRoleDto: GrantRoleDto, @Request() req) {
    await this.rbacService.grantRole(
      grantRoleDto.userId,
      grantRoleDto.roleName,
      req.user.user_id,
    );
    return { message: 'Role granted successfully' };
  }

  @Post('revoke-role')
  @SuperAdminOnly()
  @ApiOperation({ summary: 'Revoke role from user' })
  @ApiResponse({ status: 200, description: 'Role revoked successfully' })
  async revokeRole(@Body() revokeRoleDto: RevokeRoleDto, @Request() req) {
    await this.rbacService.revokeRole(
      revokeRoleDto.userId,
      revokeRoleDto.roleName,
      req.user.user_id,
    );
    return { message: 'Role revoked successfully' };
  }

  @Post('check-permission/:userId/:resource/:action')
  @RequirePermissions('users:read')
  @ApiOperation({ summary: 'Check if user has specific permission' })
  @ApiResponse({ status: 200, description: 'Permission check result' })
  async checkPermission(
    @Param('userId') userId: string,
    @Param('resource') resource: string,
    @Param('action') action: string,
  ) {
    const hasPermission = await this.rbacService.hasPermission(userId, resource, action);
    return { hasPermission };
  }

  @Delete('cache/:userId')
  @SuperAdminOnly()
  @ApiOperation({ summary: 'Clear user permissions cache' })
  @ApiResponse({ status: 200, description: 'Cache cleared successfully' })
  async clearUserCache(@Param('userId') userId: string) {
    await this.rbacService.clearUserCache(userId);
    return { message: 'Cache cleared successfully' };
  }
}
