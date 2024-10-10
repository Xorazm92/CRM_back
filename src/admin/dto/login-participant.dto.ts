import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginAdminDto {
  @ApiProperty({ example: 'qwerty' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'qwerty' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
