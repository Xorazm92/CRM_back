import { UserRole } from "@prisma/client";

export class UpdateUserDto {
    full_name?: string;
    role?: string;
  }