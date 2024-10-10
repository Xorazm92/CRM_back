import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPhoneNumber, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Muhammadjon', description: "User's Name" })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({
    example: 'example@gmail.com',
    description: "User's email",
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'muhammadjon',
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

  @ApiProperty({ example: 'Toshkent shahri', description: "User's address" })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: '1000000', description: 'User balance' })
  balance: number;
}
