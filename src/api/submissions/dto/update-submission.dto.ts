import { PartialType } from '@nestjs/mapped-types';
import { CreateSubmissionDto } from './create-submission.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsDateString } from 'class-validator';

export class UpdateSubmissionDto extends PartialType(CreateSubmissionDto) {
  @ApiProperty({ description: 'Grade for the submission', example: 'A', required: false })
  @IsString()
  @IsOptional()
  grade?: string;

  @ApiProperty({ description: 'Feedback for the submission', example: 'Great job!', required: false })
  @IsString()
  @IsOptional()
  feedback?: string;

  @ApiProperty({ description: 'Teacher ID who graded', example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  @IsUUID()
  @IsOptional()
  graded_by?: string;

  @ApiProperty({ description: 'Date when graded', example: '2025-04-14T10:30:00Z', required: false })
  @IsDateString()
  @IsOptional()
  graded_at?: Date;
}
