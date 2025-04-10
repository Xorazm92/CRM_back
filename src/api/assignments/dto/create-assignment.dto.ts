
import { IsString, IsNotEmpty, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAssignmentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsDateString()
  deadline: Date;

  @ApiProperty()
  @IsUUID()
  lesson_id: string;

  @ApiProperty()
  @IsUUID()
  group_id: string;
}
