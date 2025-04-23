import { IsInt, IsString, IsDateString, IsOptional, Min, Max } from 'class-validator';

export class CreateDiscountDto {
  @IsString()
  student_id: string;

  @IsInt()
  @Min(1)
  @Max(100)
  percent: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  valid_from: string;

  @IsDateString()
  valid_to: string;
}
