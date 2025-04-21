import { Controller, Get, Param, Put, Post, Delete, Body, NotFoundException } from '@nestjs/common';
import { SettingService } from './setting.service';

@Controller('settings')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Get()
  async getAll() {
    return this.settingService.getAll();
  }

  @Get(':key')
  async getOne(@Param('key') key: string) {
    const setting = await this.settingService.getOne(key);
    if (!setting) throw new NotFoundException('Setting not found');
    return setting;
  }

  @Put(':key')
  async update(@Param('key') key: string, @Body('value') value: string) {
    return this.settingService.update(key, value);
  }

  @Post()
  async create(@Body() dto: { key: string; value: string }) {
    return this.settingService.create(dto.key, dto.value);
  }

  @Delete(':key')
  async remove(@Param('key') key: string) {
    return this.settingService.remove(key);
  }
}
