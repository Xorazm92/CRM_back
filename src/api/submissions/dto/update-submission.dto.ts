import { PartialType } from '@nestjs/mapped-types';
import { CreateSubmissionDto } from './create-submission.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsDateString } from 'class-validator';

export class UpdateSubmissionDto extends PartialType(CreateSubmissionDto) {
  @ApiProperty({
    description: 'Optional new file path for the submission',
    example: '/uploads/submissions/updated-file.pdf',
    required: false,
  })
  @IsString()
  @IsOptional()
  file_path?: string;

  @ApiProperty({
    description: 'Optional new grade for the submission',
    example: '98',
    required: false,
  })
  @IsString()
  @IsOptional()
  grade?: string;

  @ApiProperty({
    description: 'Optional new feedback for the submission',
    example: 'Great improvement! Keep it up!',
    required: false,
  })
  @IsString()
  @IsOptional()
  feedback?: string;

  @ApiProperty({
    description: 'Optional new graded date for the submission',
    example: '2025-04-15T10:30:00Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  graded_at?: Date;
}
