import { Controller, Get, Post, Body, Param, Put, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreateStudentPaymentDto } from './dto/create-student-payment.dto';
import { CreateTeacherSalaryDto } from './dto/create-teacher-salary.dto';
import { PaymentStatus } from './dto/payment-status.enum';
import { AdminGuard } from 'src/common/guard/admin.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('student')
  createStudentPayment(@Body() dto: CreateStudentPaymentDto) {
    return this.paymentService.createStudentPayment(dto);
  }

  @Post('teacher')
  createTeacherSalary(@Body() dto: CreateTeacherSalaryDto) {
    return this.paymentService.createTeacherSalary(dto);
  }

  @Get('student/:id')
  getStudentPayments(@Param('id') id: string) {
    return this.paymentService.getStudentPaymentHistory(id);
  }

  @Get('teacher/:id')
  getTeacherSalaries(@Param('id') id: string) {
    return this.paymentService.getTeacherSalaryHistory(id);
  }

  @Put('student/:id/status')
  updatePaymentStatus(
    @Param('id') id: string,
    @Body('status') status: PaymentStatus,
  ) {
    return this.paymentService.updatePaymentStatus(id, status);
  }

  @Put('teacher/:id/status')
  updateSalaryStatus(
    @Param('id') id: string,
    @Body('status') status: PaymentStatus,
  ) {
    return this.paymentService.updateSalaryStatus(id, status);
  }
}
