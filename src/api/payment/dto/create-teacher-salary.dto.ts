import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus } from '@prisma/client';
import { IsNotEmpty, IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateTeacherSalaryDto {
  @ApiProperty({ description: 'O‘qituvchi IDsi', example: 'uuid-string' })
  @IsNotEmpty()
  @IsString()
  teacher_id: string;

  @ApiProperty({ description: 'Oylik summa (so‘m)', example: 2000000 })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Izoh (ixtiyoriy)', required: false, example: 'Bonus uchun' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'To‘lov statusi', enum: PaymentStatus, example: PaymentStatus.PENDING, required: false })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;
}
