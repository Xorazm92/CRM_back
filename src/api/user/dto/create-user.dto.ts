import { UserRole } from "@prisma/client";
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Username for login',
    example: 'john_doe',
    required: true,
  })
  username: string;

  @ApiProperty({
    description: 'User password',
    example: 'securepassword123',
    required: true,
  })
  password: string;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
    required: false,
  })
  full_name?: string;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    example: UserRole.STUDENT,
    required: false,
  })
  role?: UserRole;
}