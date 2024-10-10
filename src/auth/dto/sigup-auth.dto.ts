
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPhoneNumber, IsString } from 'class-validator';

export class SignUpAuthDto {
  @ApiProperty({ example: 'Xamidullo', description: "User's Name" })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({
    example: 'xammidullo@gmail.com',
    description: "User's email",
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'xammidullo',
    description: "User's username",
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    example: 'My$ecr&tp@ssw0rd',
    description: "User's password",
  })
  password: string;

}
