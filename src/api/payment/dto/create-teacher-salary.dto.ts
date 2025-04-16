import { PaymentStatus } from '@prisma/client';
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
  status: PaymentStatus;
  // Quyidagilarni olib tashlash kerak, chunki DTO uchun valid emas:
  // status: any;
  // payment_date: any;
  // payment_type: any;
}
