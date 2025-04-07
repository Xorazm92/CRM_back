import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({
    type: String,
    description: 'FullName of admin',
    example: 'Jhon Doe',
  })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({
    type: String,
    description: 'Username of admin',
    example: 'jhondoe007',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    type: String,
    description: 'Password of admin',
    example: 'jhondoe007!A',
  })
  @IsStrongPassword()
  @IsNotEmpty()
  password: string;
}
