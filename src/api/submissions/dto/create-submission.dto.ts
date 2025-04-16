import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubmissionDto {
  @ApiProperty({
    description: 'Assignment ID that this submission belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsUUID()
  @IsNotEmpty()
  assignment_id: string;

  @ApiProperty({
    description: 'Student ID who submitted the assignment',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsUUID()
  @IsNotEmpty()
  student_id: string;

  @ApiProperty({
    description: 'File path for the submission',
    example: '/uploads/submissions/file.pdf',
    required: false,
  })
  @IsString()
  @IsOptional()
  file_path?: string;

  @ApiProperty({
    description: 'Answer text for the submission',
    example: 'My answer',
    required: false,
  })
  @IsString()
  @IsOptional()
  answer_text?: string;
}
