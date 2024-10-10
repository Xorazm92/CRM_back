import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({ example: 'Muhammadjon', description: 'Amdin Name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '56d54d6f6f', description: 'Amdin Password' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: '56d54d6f6f', description: 'Amdin Confirm Password' })
  confirm_password: string;

  @ApiProperty({ example: '+998901006706', description: 'Admin Phone Number' })
  phone: string;
}
