import { IsString, IsOptional, IsEmail, IsEnum, IsDateString, MinLength, MaxLength } from 'class-validator';
import { Gender, UserRole } from "@prisma/client";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
}

export class CreateUserDto {
  @ApiProperty({ description: 'Username for login', example: 'john_doe' })
  @IsString()
  username: string;

  @ApiProperty({ description: 'User password', example: 'securepassword123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'Name of the user', example: 'John' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Lastname of the user', example: 'Doe' })
  @IsString()
  lastname: string;

  @ApiProperty({ description: 'User middle name', example: 'Ali', required: false })
  @IsOptional()
  @IsString()
  middlename?: string;

  @ApiProperty({ description: 'User email address', example: 'john@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'User birthdate', example: '2000-01-01', required: false, type: String, format: 'date' })
  @IsOptional()
  @IsDateString()
  birthdate?: Date;

  @ApiProperty({ description: 'User gender', example: 'MALE', enum: Gender, required: false })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({ description: 'User address', example: 'Toshkent, Yunusobod', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'User avatar URL', example: 'https://example.com/avatar.png', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ description: 'User phone number', example: '+998901234567', required: false })
  @IsOptional()
  @IsString()
  phone_number?: string;

  @ApiProperty({ description: 'User role', example: 'STUDENT', enum: UserRole, default: UserRole.STUDENT })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({ description: 'User status', example: 'ACTIVE', enum: UserStatus, default: UserStatus.ACTIVE })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiProperty({ description: 'Last login date', example: '2025-04-23T21:00:00.000Z', required: false, type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  last_login?: Date;
}