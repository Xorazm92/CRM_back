import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class CreateTeacherDto {
  @ApiProperty({
    type: String,
    description: 'FullName of teacher',
    example: 'Jhon Doe',
  })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({
    type: String,
    description: 'Username of teacher',
    example: 'jhondoe007',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    type: String,
    description: 'Password of teacher',
    example: 'jhondoe007!A',
  })
  @IsStrongPassword()
  @IsNotEmpty()
  password: string;
}
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class CreateTeacherDto {
  @ApiProperty({
    type: String,
    description: 'FullName of teacher',
    example: 'John Smith',
  })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({
    type: String,
    description: 'Username of teacher',
    example: 'johnsmith',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    type: String,
    description: 'Password of teacher',
    example: 'JohnSmith123!',
  })
  @IsStrongPassword()
  @IsNotEmpty()
  password: string;
}
