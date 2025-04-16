import { IsNotEmpty, IsString, IsISO8601 } from 'class-validator';

export class CreateLessonDto {
  @IsNotEmpty({ message: 'Topic is required' })
  @IsString()
  topic: string;

  @IsNotEmpty({ message: 'Lesson date is required' })
  @IsISO8601({}, { message: 'lesson_date must be a valid ISO8601 date string' })
  lesson_date: string;

  @IsNotEmpty({ message: 'Group ID is required' })
  @IsString()
  group_id: string;

  @IsNotEmpty({ message: 'Recording path is required' })
  @IsString()
  recording_path: string;
}