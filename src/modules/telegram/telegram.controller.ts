import { Body, Controller, Delete, Get, Post, UseFilters, UseGuards } from '@nestjs/common';
import { HttpExceptionFilter } from 'src/common/exceptions';

import { AdminRoles } from '../admins/constants';
import { RolesAuth } from '../auth/decorators';
import { RolesAuthGuard } from '../auth/guard';
import { SetWebhookDto } from './dto/set-webhook.dto';
import { TelegramService } from './telegram.service';

@UseFilters(new HttpExceptionFilter())
@UseGuards(RolesAuthGuard)
@RolesAuth(AdminRoles.SUPER_ADMIN)
@Controller('api/telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Get('webhook')
  async getWebhookInfo() {
    return this.telegramService.getWebhookInfo();
  }

  @Post('webhook')
  async setWebhook(@Body() setWebhookDto: SetWebhookDto) {
    return this.telegramService.setWebhook(setWebhookDto.host);
  }

  @Delete('webhook')
  async removeWebhook() {
    return this.telegramService.removeWebhook();
  }

  @Get('updates')
  async getUpdates() {
    return this.telegramService.getUpdates();
  }
}
