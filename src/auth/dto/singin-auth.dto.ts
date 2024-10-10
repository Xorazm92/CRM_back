import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class SignInAuthDto {

  @ApiProperty({ example: 'example@gmail.com' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'My$ecr&tp@ssw0rd' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

