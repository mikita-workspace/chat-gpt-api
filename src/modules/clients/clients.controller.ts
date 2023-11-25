import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { AdminRole } from '../admins/constants';
import { RolesAuth } from '../auth/decorators';
import { JwtAuthGuard, RolesAuthGuard } from '../auth/guard';
import { RequestWithAdmin } from '../auth/types';
import { ClientsService } from './clients.service';
import { ChangeStateClientDto } from './dto/change-state-client.dto';
import { CreateClientDto } from './dto/create-client.dto';
import { FeedbackClientDto } from './dto/feedback-client.dto';
import { ClientsMailingDto } from './dto/mailing-clients.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { UpdateClientAccountLevelDto } from './dto/update-client-account-level.dto';
import { UpdateClientAccountLevelNameDto } from './dto/update-client-account-level-name.dto';
import { UpdateClientMetadataDto } from './dto/update-metadata-client.dto';

@UseGuards(RolesAuthGuard)
@UseInterceptors(CacheInterceptor)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  async create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req: RequestWithAdmin) {
    return this.clientsService.findAll(
      req.admin.role === AdminRole.MODERATOR
        ? { where: { state: { is: { isApproved: true } } } }
        : {},
    );
  }

  @RolesAuth(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @Get('unauthorized')
  async findUnauthorized() {
    return this.clientsService.findAll({ where: { state: { is: { isApproved: false } } } });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.clientsService.findOne(Number(id));
  }

  @RolesAuth(AdminRole.SUPER_ADMIN)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientsService.update(Number(id), updateClientDto);
  }

  @RolesAuth(AdminRole.SUPER_ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.clientsService.remove(Number(id));
  }

  @Get('availability/:id')
  async availability(@Param('id') id: string) {
    return this.clientsService.availability(Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Post('changeState')
  async changeState(
    @Body() changeStateClientDto: ChangeStateClientDto,
    @Req() req: RequestWithAdmin,
  ) {
    return this.clientsService.changeState(changeStateClientDto, req.admin.role as AdminRole);
  }

  @Post('feedback')
  async setClientFeedback(@Body() feedbackClientDto: FeedbackClientDto) {
    return this.clientsService.setClientFeedback(feedbackClientDto);
  }

  @Post('accountLevel')
  async updateClientAccountLevel(@Body() { telegramId }: UpdateClientAccountLevelDto) {
    return this.clientsService.updateClientAccountLevel(telegramId, {});
  }

  @Post('metadata')
  async updateClientMetadata(@Body() updateClientMetadataDto: UpdateClientMetadataDto) {
    return this.clientsService.updateClientMetadata(updateClientMetadataDto);
  }

  @RolesAuth(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @Post('accountLevel/name')
  async updateClientClientAccountLevelName(
    @Body() updateClientAccountLevelNameDto: UpdateClientAccountLevelNameDto,
  ) {
    return this.clientsService.updateClientAccountLevelName(updateClientAccountLevelNameDto);
  }

  @RolesAuth(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @Post('mailing')
  async clientsMailing(@Body() clientsMailingDto: ClientsMailingDto) {
    return this.clientsService.clientsMailing(clientsMailingDto);
  }
}
