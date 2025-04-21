import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({
    type: String,
    description: 'Name of admin',
    example: 'Jhon',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    type: String,
    description: 'Lastname of admin',
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty()
  lastname: string;

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
