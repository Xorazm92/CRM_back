import { UserRole } from "@prisma/client";

export class CreateUserDto {
  username: string;
  password: string;
  full_name?: string;
  role?: string;
}