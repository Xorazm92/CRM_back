import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, ArrayNotEmpty } from 'class-validator';

export class AddMemberDto {
  @ApiProperty({
    type: String,
    description: 'Group id',
    example: 'b4276965-dbdf-40c8-b467-0a882a02fd91',
  })
  @IsString()
  @IsNotEmpty()
  group_id: string;

  @ApiProperty({
    type: [String],
    description: 'User ids',
    example: ['7a2f9f98-9b77-423b-944e-b32d2f5d15c8', '1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  user_ids: string[];
}
