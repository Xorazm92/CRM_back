import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsStrongPassword, IsDateString, IsEnum, IsOptional } from 'class-validator';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export class CreateStudentDto {
  @ApiProperty({ type: String, description: 'Username of student', example: 'zafar.davron' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ type: String, description: 'Name of student', example: 'Zafar' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: String, description: 'Lastname of student', example: 'Davron' })
  @IsString()
  @IsNotEmpty()
  lastname: string;

  @ApiProperty({ type: String, description: 'Middlename of student', example: 'Salo', required: false })
  @IsString()
  @IsOptional()
  middlename?: string;

  @ApiProperty({ type: String, description: 'Birthdate of student', example: '2002-02-02', required: false })
  @IsDateString()
  @IsOptional()
  birthdate?: string;

  @ApiProperty({ enum: Gender, description: 'Gender of student', example: 'male', required: false })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiProperty({ type: String, description: 'Address', example: 'Qarshi', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ type: String, description: 'Payment', example: '350000', required: false })
  @IsString()
  @IsOptional()
  payment?: string;

  @ApiProperty({ type: String, description: 'Phone number', example: '+998622582525', required: false })
  @IsString()
  @IsOptional()
  phone_number?: string;

  @ApiProperty({ type: String, description: 'Password of student', example: 'KuchliParol123!' })
  @IsStrongPassword()
  @IsNotEmpty()
  password: string;
}
