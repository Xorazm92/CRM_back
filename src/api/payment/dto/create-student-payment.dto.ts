import { IsNotEmpty, IsNumber, IsString, IsEnum, IsOptional } from 'class-validator';
import { PaymentType } from '@prisma/client';

export class CreateStudentPaymentDto {
  @IsNotEmpty()
  @IsString()
  student_id: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsEnum(PaymentType)
  payment_type: PaymentType;

  @IsOptional()
  @IsString()
  description?: string;
}
