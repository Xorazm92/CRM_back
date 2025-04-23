import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { DiscountService } from './discount.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Discounts')
@Controller('discounts')
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @Post()
  @ApiOperation({ summary: 'Create discount', description: 'Student uchun chegirma yaratish' })
  @ApiResponse({ status: 201, description: 'Chegirma yaratildi' })
  async create(@Body() dto: CreateDiscountDto) {
    return this.discountService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all discounts', description: 'Barcha chegirmalarni olish' })
  async findAll() {
    return this.discountService.findAll();
  }

  @Get('student/:student_id')
  @ApiOperation({ summary: 'Get student discounts', description: 'Student uchun barcha chegirmalar' })
  @ApiParam({ name: 'student_id', type: String })
  async findByStudent(@Param('student_id') student_id: string) {
    return this.discountService.findByStudent(student_id);
  }

  @Get('student/:student_id/active')
  @ApiOperation({ summary: 'Get active discount for student', description: 'Student uchun hozir amal qilayotgan chegirma' })
  @ApiParam({ name: 'student_id', type: String })
  async findActiveByStudent(@Param('student_id') student_id: string) {
    return this.discountService.findActiveByStudent(student_id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete discount', description: 'Chegirmani o‘chirish' })
  @ApiParam({ name: 'id', type: String })
  async remove(@Param('id') id: string) {
    return this.discountService.remove(id);
  }
}
