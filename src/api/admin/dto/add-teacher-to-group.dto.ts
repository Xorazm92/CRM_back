import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddTeacherToGroupDto {
  @ApiProperty({
    type: String,
    description: 'Group id',
    example: 'b4276965-dbdf-40c8-b467-0a882a02fd91',
  })
  @IsString()
  @IsNotEmpty()
  group_id: string;

  @ApiProperty({
    type: String,
    description: 'Teacher id',
    example: '2947e882-6e30-4662-a308-b8dbe636f705',
  })
  @IsString()
  @IsNotEmpty()
  teacher_id: string;
}
