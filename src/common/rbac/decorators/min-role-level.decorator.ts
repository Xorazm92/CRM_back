import { SetMetadata } from '@nestjs/common';

export const MIN_ROLE_LEVEL_KEY = 'min_role_level';

/**
 * Decorator to specify minimum role level required for access
 * @param level Minimum role level (higher number = higher privilege)
 */
export const RequireMinRoleLevel = (level: number) =>
  SetMetadata(MIN_ROLE_LEVEL_KEY, level);

/**
 * Common role level decorators
 */

// Role levels (higher number = higher privilege)
export const ROLE_LEVELS = {
  STUDENT: 1,
  TEACHER: 2,
  MANAGER: 3,
  ADMIN: 4,
  SUPERADMIN: 5,
} as const;

// Convenience decorators
export const RequireStudentLevel = () => RequireMinRoleLevel(ROLE_LEVELS.STUDENT);
export const RequireTeacherLevel = () => RequireMinRoleLevel(ROLE_LEVELS.TEACHER);
export const RequireManagerLevel = () => RequireMinRoleLevel(ROLE_LEVELS.MANAGER);
export const RequireAdminLevel = () => RequireMinRoleLevel(ROLE_LEVELS.ADMIN);
export const RequireSuperAdminLevel = () => RequireMinRoleLevel(ROLE_LEVELS.SUPERADMIN);
