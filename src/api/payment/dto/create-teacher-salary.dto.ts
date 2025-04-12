
import { IsNotEmpty, IsNumber, IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateTeacherSalaryDto {
  @IsNotEmpty()
  @IsString()
  teacher_id: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsDateString()
  month: Date;

  @IsOptional()
  @IsString()
  description?: string;
}
