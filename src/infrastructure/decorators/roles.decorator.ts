import { SetMetadata } from '@nestjs/common';

// Accept both string and enum values for roles
export const Roles = (...roles: (string | number)[]) => SetMetadata('roles', roles);
