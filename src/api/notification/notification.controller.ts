import { Controller, Get, Param, Patch, Delete } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get(':user_id')
  @ApiOperation({ summary: 'Get notifications for user', description: 'User uchun barcha notificationlarni olish' })
  @ApiParam({ name: 'user_id', type: String })
  async findByUser(@Param('user_id') user_id: string) {
    return this.notificationService.findByUser(user_id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read', description: 'Notificationni o‘qilgan deb belgilash' })
  @ApiParam({ name: 'id', type: String })
  async markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification', description: 'Notificationni o‘chirish' })
  @ApiParam({ name: 'id', type: String })
  async delete(@Param('id') id: string) {
    return this.notificationService.delete(id);
  }
}
