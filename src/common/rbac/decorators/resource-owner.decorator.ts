import { SetMetadata } from '@nestjs/common';

export const RESOURCE_OWNER_KEY = 'resource_owner';

export interface ResourceOwnerConfig {
  resource: string;
  idParam: string;
  ownerField: string;
  allowSelf?: boolean;
}

/**
 * Decorator to check if user owns the resource or has permission to access it
 * @param config Resource owner configuration
 */
export const RequireResourceOwner = (config: ResourceOwnerConfig) =>
  SetMetadata(RESOURCE_OWNER_KEY, config);

/**
 * Common resource owner decorators
 */

// User resource ownership
export const RequireUserOwnership = (idParam: string = 'id') =>
  RequireResourceOwner({
    resource: 'user',
    idParam,
    ownerField: 'user_id',
    allowSelf: true,
  });

// Group resource ownership
export const RequireGroupOwnership = (idParam: string = 'id') =>
  RequireResourceOwner({
    resource: 'groups',
    idParam,
    ownerField: 'teacher_id',
    allowSelf: false,
  });

// Payment resource ownership
export const RequirePaymentOwnership = (idParam: string = 'id') =>
  RequireResourceOwner({
    resource: 'studentPayment',
    idParam,
    ownerField: 'student_id',
    allowSelf: true,
  });

// Assignment resource ownership
export const RequireAssignmentOwnership = (idParam: string = 'id') =>
  RequireResourceOwner({
    resource: 'assignments',
    idParam,
    ownerField: 'teacher_id',
    allowSelf: true,
  });

// Submission resource ownership
export const RequireSubmissionOwnership = (idParam: string = 'id') =>
  RequireResourceOwner({
    resource: 'submissions',
    idParam,
    ownerField: 'student_id',
    allowSelf: true,
  });
