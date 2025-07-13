import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to specify required permissions for a route
 * @param permissions Array of permission strings (e.g., ['users:read', 'users:write'])
 */
export const RequirePermissions = (...permissions: string[]) => 
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * Common permission decorators for convenience
 */

// User permissions
export const CanReadUsers = () => RequirePermissions('users:read');
export const CanCreateUsers = () => RequirePermissions('users:create');
export const CanUpdateUsers = () => RequirePermissions('users:update');
export const CanDeleteUsers = () => RequirePermissions('users:delete');
export const CanManageUsers = () => RequirePermissions('users:*');

// Course permissions
export const CanReadCourses = () => RequirePermissions('courses:read');
export const CanCreateCourses = () => RequirePermissions('courses:create');
export const CanUpdateCourses = () => RequirePermissions('courses:update');
export const CanDeleteCourses = () => RequirePermissions('courses:delete');
export const CanManageCourses = () => RequirePermissions('courses:*');

// Group permissions
export const CanReadGroups = () => RequirePermissions('groups:read');
export const CanCreateGroups = () => RequirePermissions('groups:create');
export const CanUpdateGroups = () => RequirePermissions('groups:update');
export const CanDeleteGroups = () => RequirePermissions('groups:delete');
export const CanManageGroups = () => RequirePermissions('groups:*');

// Payment permissions
export const CanReadPayments = () => RequirePermissions('payments:read');
export const CanCreatePayments = () => RequirePermissions('payments:create');
export const CanUpdatePayments = () => RequirePermissions('payments:update');
export const CanDeletePayments = () => RequirePermissions('payments:delete');
export const CanManagePayments = () => RequirePermissions('payments:*');

// Attendance permissions
export const CanReadAttendance = () => RequirePermissions('attendance:read');
export const CanCreateAttendance = () => RequirePermissions('attendance:create');
export const CanUpdateAttendance = () => RequirePermissions('attendance:update');
export const CanDeleteAttendance = () => RequirePermissions('attendance:delete');
export const CanManageAttendance = () => RequirePermissions('attendance:*');

// Assignment permissions
export const CanReadAssignments = () => RequirePermissions('assignments:read');
export const CanCreateAssignments = () => RequirePermissions('assignments:create');
export const CanUpdateAssignments = () => RequirePermissions('assignments:update');
export const CanDeleteAssignments = () => RequirePermissions('assignments:delete');
export const CanManageAssignments = () => RequirePermissions('assignments:*');

// Report permissions
export const CanReadReports = () => RequirePermissions('reports:read');
export const CanCreateReports = () => RequirePermissions('reports:create');
export const CanManageReports = () => RequirePermissions('reports:*');

// System permissions
export const CanManageSystem = () => RequirePermissions('system:*');
export const CanManageRoles = () => RequirePermissions('roles:*');
export const CanViewDashboard = () => RequirePermissions('dashboard:read');

// Super admin permissions
export const SuperAdminOnly = () => RequirePermissions('*:*');
