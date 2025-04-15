import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateLessonDto {
  @IsNotEmpty({ message: 'Topic is required' })
  @IsString()
  topic: string;

  @IsOptional()
  @IsString()
  description?: string;

  // Add other required fields as needed
}
