import { Controller, Get, Post, Body, Param, Put, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreateStudentPaymentDto } from './dto/create-student-payment.dto';
import { CreateTeacherSalaryDto } from './dto/create-teacher-salary.dto';
import { PaymentStatus } from '@prisma/client';
import { AdminGuard } from 'src/common/guard/admin.guard';
import { JwtAuthGuard } from 'src/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from 'src/infrastructure/guards/roles.guard';
import { Roles } from 'src/infrastructure/decorators/roles.decorator';
import { ApiBearerAuth, ApiTags, ApiBody, ApiParam, ApiNotFoundResponse, ApiBadRequestResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ValidationPipe, UsePipes, BadRequestException, NotFoundException } from '@nestjs/common';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('student')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student', 'admin', 'manager')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Create student payment', description: 'O‘quvchi uchun to‘lov qilish. Chegirma description orqali: "discount:20". Har bir student har 30 kunda faqat 1 marta to‘lov qilishi mumkin.' })
  @ApiBody({ type: CreateStudentPaymentDto })
  @ApiResponse({ status: 201, description: 'To‘lov muvaffaqiyatli yaratildi.' })
  @ApiBadRequestResponse({ description: 'Xato yoki noto‘g‘ri so‘rov.' })
  async createStudentPayment(@Body() dto: CreateStudentPaymentDto) {
    try {
      return await this.paymentService.createStudentPayment(dto);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Post('teacher')
  @UseGuards(AdminGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Create teacher salary', description: 'O‘qituvchiga oylik yozish (faqat admin uchun). Odatda avtomatik student payment orqali yaratiladi.' })
  @ApiBody({ type: CreateTeacherSalaryDto })
  @ApiResponse({ status: 201, description: 'Teacher salary created' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async createTeacherSalary(@Body() dto: CreateTeacherSalaryDto) {
    try {
      return await this.paymentService.createTeacherSalary(dto);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get('student/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'ADMIN', 'manager', 'MANAGER')
  @ApiOperation({ summary: 'Get student payment history', description: 'O‘quvchining barcha to‘lovlari tarixini olish.' })
  @ApiParam({ name: 'id', type: String, required: true, description: 'Student UUID' })
  @ApiResponse({ status: 200, description: 'Student to‘lovlari tarixi' })
  @ApiNotFoundResponse({ description: 'Student topilmadi.' })
  async getStudentPayments(@Param('id') id: string) {
    try {
      return await this.paymentService.getStudentPaymentHistory(id);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }

  @Get('teacher/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'ADMIN', 'manager', 'MANAGER')
  @ApiOperation({ summary: 'Get teacher salaries', description: 'O‘qituvchining barcha oyliklari tarixini olish.' })
  @ApiParam({ name: 'id', type: String, required: true, description: 'Teacher UUID' })
  @ApiResponse({ status: 200, description: 'Teacher salary history' })
  @ApiNotFoundResponse({ description: 'Teacher topilmadi.' })
  async getTeacherSalaries(@Param('id') id: string) {
    try {
      return await this.paymentService.getTeacherSalaryHistory(id);
    } catch (e) {
      throw new NotFoundException(e.message);
    }
  }

  // Barcha student to'lovlarini olish (faqat admin/manager ko'radi)
  @Get('student-payments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'ADMIN', 'manager', 'MANAGER')
  @ApiOperation({ summary: 'Get all student payments', description: 'Barcha o‘quvchilarning barcha to‘lovlarini olish (faqat admin/manager).' })
  @ApiResponse({ status: 200, description: 'Barcha student to‘lovlari' })
  async getAllStudentPayments() {
    return this.paymentService.getAllStudentPayments();
  }

  @Put('student/:id/status')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Update student payment status', description: 'O‘quvchi to‘lovining statusini o‘zgartirish.' })
  @ApiParam({ name: 'id', type: String, required: true, description: 'Student payment UUID' })
  @ApiBody({ schema: { type: 'object', properties: { status: { type: 'string', enum: Object.values(PaymentStatus) } } } })
  @ApiResponse({ status: 200, description: 'Student payment status updated' })
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
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Update teacher salary status', description: 'O‘qituvchi oyligi statusini o‘zgartirish.' })
  @ApiParam({ name: 'id', type: String, required: true, description: 'Salary UUID' })
  @ApiBody({ schema: { type: 'object', properties: { status: { type: 'string', enum: Object.values(PaymentStatus) } } } })
  @ApiResponse({ status: 200, description: 'Salary status updated' })
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

  // Avtomatik teacher oyliklarini hisoblash va yozish
  @Post('teacher/calculate-salaries')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Calculate teacher salaries', description: 'Barcha o‘qituvchilar uchun avtomatik oylik hisoblash.' })
  @ApiResponse({ status: 200, description: 'Barcha o‘qituvchilar uchun oyliklar hisoblandi.' })
  async calculateTeacherSalaries() {
    try {
      return await this.paymentService.calculateTeacherSalaries();
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  // Teacher oyligini to'lash (statusini o'zgartirish)
  @Put('teacher/:salaryId/pay')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Pay teacher salary', description: 'O‘qituvchining oyligini to‘lash (statusini COMPLETED qilish).' })
  @ApiParam({ name: 'salaryId', type: String, required: true, description: 'Salary UUID' })
  @ApiResponse({ status: 200, description: 'Salary paid' })
  async payTeacherSalary(@Param('salaryId') salaryId: string) {
    try {
      return await this.paymentService.updateSalaryStatus(salaryId, PaymentStatus.COMPLETED);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
