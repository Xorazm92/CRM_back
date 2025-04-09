import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class ConfirmPasswordDto {
  @ApiProperty({
    type: String,
    description: 'Old Password',
    example: 'jhondoe007!A',
  })
  @IsString()
  @IsNotEmpty()
  old_password: string;


  @ApiProperty({
    type: String,
    description: 'New Password',
    example: 'jhondoe007!P',
  })
  @IsStrongPassword()
  @IsNotEmpty()
  new_password: string;
}
