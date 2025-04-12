
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsEnum, IsDate, IsOptional } from 'class-validator';
import { PaymentType, PaymentStatus } from '@prisma/client';

export class CreateStudentPaymentDto {
  @ApiProperty({
    description: 'O\'quvchi ID',
    example: 'uuid'
  })
  @IsString()
  @IsNotEmpty()
  student_id: string;

  @ApiProperty({
    description: 'To\'lov summasi',
    example: 500000
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: 'To\'lov turi',
    enum: PaymentType,
    example: PaymentType.CASH
  })
  @IsEnum(PaymentType)
  payment_type: PaymentType;

  @ApiProperty({
    description: 'To\'lov holati',
    enum: PaymentStatus,
    example: PaymentStatus.PAID
  })
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @ApiProperty({
    description: 'To\'lov sanasi',
    example: '2025-04-15'
  })
  @IsDate()
  payment_date: Date;

  @ApiProperty({
    description: 'Izoh',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;
}
