import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, IsEnum } from 'class-validator';

import { UserRole } from '@prisma/client';


export class RegisterDto {
  @ApiProperty({
    description: 'Foydalanuvchi to\'liq ismi',
    example: 'John Doe'
  })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({
    description: 'Foydalanuvchi nomi',
    example: 'johndoe'
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Parol (minimum 6 ta belgi)',
    example: 'password123'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Foydalanuvchi roli',
    enum: UserRole,
    example: UserRole.ADMIN
  })
  @IsEnum(UserRole)
  role: UserRole;
}

export class LoginDto {
  @ApiProperty({
    description: 'Foydalanuvchi nomi',
    example: 'johndoe'
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Parol',
    example: 'password123'
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class TokenResponseDto {
  @ApiProperty()
  access_token: string;

  @ApiProperty()
  refresh_token: string;
}
