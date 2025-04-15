import { Controller, Get, Post, Body, Param, Put, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreateStudentPaymentDto } from './dto/create-student-payment.dto';
import { CreateTeacherSalaryDto } from './dto/create-teacher-salary.dto';
import { PaymentStatus } from './dto/payment-status.enum';
import { AdminGuard } from 'src/common/guard/admin.guard';
import { ApiBearerAuth, ApiTags, ApiBody, ApiParam, ApiNotFoundResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { ValidationPipe, UsePipes, BadRequestException, NotFoundException } from '@nestjs/common';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('student')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiBody({ type: CreateStudentPaymentDto })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async createStudentPayment(@Body() dto: CreateStudentPaymentDto) {
    try {
      return await this.paymentService.createStudentPayment(dto);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Post('teacher')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiBody({ type: CreateTeacherSalaryDto })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async createTeacherSalary(@Body() dto: CreateTeacherSalaryDto) {
    try {
      return await this.paymentService.createTeacherSalary(dto);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get('student/:id')
  @ApiParam({ name: 'id', type: String, required: true })
  @ApiNotFoundResponse({ description: 'Not Found' })
  async getStudentPayments(@Param('id') id: string) {
    try {
      return await this.paymentService.getStudentPaymentHistory(id);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }

  @Get('teacher/:id')
  @ApiParam({ name: 'id', type: String, required: true })
  @ApiNotFoundResponse({ description: 'Not Found' })
  async getTeacherSalaries(@Param('id') id: string) {
    try {
      return await this.paymentService.getTeacherSalaryHistory(id);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }

  @Put('student/:id/status')
  @ApiParam({ name: 'id', type: String, required: true })
  @ApiBody({ schema: { type: 'object', properties: { status: { type: 'string', enum: Object.values(PaymentStatus) } } } })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async updatePaymentStatus(
    @Param('id') id: string,
    @Body('status') status: PaymentStatus,
  ) {
    try {
      return await this.paymentService.updatePaymentStatus(id, status);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Put('teacher/:id/status')
  @ApiParam({ name: 'id', type: String, required: true })
  @ApiBody({ schema: { type: 'object', properties: { status: { type: 'string', enum: Object.values(PaymentStatus) } } } })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async updateSalaryStatus(
    @Param('id') id: string,
    @Body('status') status: PaymentStatus,
  ) {
    try {
      return await this.paymentService.updateSalaryStatus(id, status);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
