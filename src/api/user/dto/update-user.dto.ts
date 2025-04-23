import { Gender, UserRole } from "@prisma/client";
import { UserStatus } from "./create-user.dto";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail, IsEnum, IsDateString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'Username', example: 'john_doe' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ description: 'User password', example: 'newpassword123' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ description: 'Name of the user', example: 'John' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Lastname of the user', example: 'Doe' })
  @IsOptional()
  @IsString()
  lastname?: string;

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

  @ApiProperty({ description: 'User role', example: 'STUDENT', enum: UserRole, required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({ description: 'User status', example: 'ACTIVE', enum: UserStatus, required: false })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiProperty({ description: 'Last login date', example: '2025-04-23T21:00:00.000Z', required: false, type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  last_login?: Date;
}