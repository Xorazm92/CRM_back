import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsEnum, IsOptional } from 'class-validator';
import { PaymentType } from '@prisma/client';

export class CreateStudentPaymentDto {
  @ApiProperty({ description: 'O‘quvchi IDsi', example: 'uuid-string' })
  @IsNotEmpty()
  @IsString()
  student_id: string;

  @ApiProperty({ description: 'To‘lov miqdori (so‘m)', example: 0 })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'To‘lov turi', enum: PaymentType, example: PaymentType.COURSE })
  @IsNotEmpty()
  @IsEnum(PaymentType)
  type: PaymentType;

  @ApiProperty({ description: 'Izoh (ixtiyoriy)', required: false, example: 'discount:20' })
  @IsOptional()
  @IsString()
  description?: string;
}
