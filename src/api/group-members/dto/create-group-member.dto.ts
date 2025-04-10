import { ApiProperty } from '@nestjs/swagger';

export class CreateGroupMemberDto {
  @ApiProperty({
    description: 'gtoup id',
    example: '1234567890abcdef',
    type: String,
    required: true,
  })
  groupId: string;

  @ApiProperty({
    description: 'user id',
    example: 'abcdef1234567890',
    type: String,
    required: true,
  })
  userId: string;
}
