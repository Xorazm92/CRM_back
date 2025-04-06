import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddMemberDto {
  @ApiProperty({
    type: String,
    description: 'user id',
    example: '7a2f9f98-9b77-423b-944e-b32d2f5d15c8',
  })
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({
    type: String,
    description: 'Group id ',
    example: '7a2f9f98-9b77-423b-944e-b32d2f5d15c8',
  })
  @IsString()
  @IsNotEmpty()
  group_id: string;
}
