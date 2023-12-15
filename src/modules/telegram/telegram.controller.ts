import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';

import { AdminRole } from '../admins/constants';
import { RolesAuth } from '../auth/decorators';
import { RolesAuthGuard } from '../auth/guard';
import { SetWebhookDto } from './dto/set-webhook.dto';
import { TelegramService } from './telegram.service';

@UseGuards(RolesAuthGuard)
@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @RolesAuth(AdminRole.SUPER_ADMIN)
  @Get('webhook')
  async getWebhookInfo() {
    return this.telegramService.getWebhookInfo();
  }

  @RolesAuth(AdminRole.SUPER_ADMIN)
  @Post('webhook')
  async setWebhook(@Body() setWebhookDto: SetWebhookDto) {
    return this.telegramService.setWebhook(setWebhookDto.host);
  }

  @RolesAuth(AdminRole.SUPER_ADMIN)
  @Delete('webhook')
  async removeWebhook() {
    return this.telegramService.removeWebhook();
  }

  @RolesAuth(AdminRole.SUPER_ADMIN)
  @Get('updates')
  async getUpdates() {
    return this.telegramService.getUpdates();
  }

  @Get('getMe')
  async getMe() {
    return this.telegramService.getMe();
  }
}
