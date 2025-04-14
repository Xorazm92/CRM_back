import { IsNotEmpty, IsString, IsOptional, IsUUID, IsDateString } from 'class-validator';
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
    description: 'Teacher ID who graded the submission',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsUUID()
  @IsNotEmpty()
  graded_by: string;

  @ApiProperty({
    description: 'File path for the submission',
    example: '/uploads/submissions/file.pdf',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  file_path: string;

  @ApiProperty({
    description: 'Grade for the submission',
    example: '95',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  grade: string;

  @ApiProperty({
    description: 'Date when the submission was graded',
    example: '2025-04-14T10:30:00Z',
    required: true,
  })
  @IsDateString()
  @IsNotEmpty()
  graded_at: Date;

  @ApiProperty({
    description: 'Feedback for the submission',
    example: 'Great job! Keep it up!',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  feedback: string;
}
