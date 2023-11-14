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
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { HttpExceptionFilter } from 'src/common/exceptions';

import { AdminRoles } from '../admins/constants';
import { RolesAuth } from '../auth/decorators';
import { JwtAuthGuard, RolesAuthGuard } from '../auth/guard';
import { RequestWithAdmin } from '../auth/types';
import { ClientsService } from './clients.service';
import { ChangeStateClientDto } from './dto/change-state-client.dto';
import { CreateClientDto } from './dto/create-client.dto';
import { FeedbackClientDto } from './dto/feedback-client.dto';
import { ClientsMailingDto } from './dto/mailing-clients.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { UpdateClientRateDto } from './dto/update-client-rate.dto';
import { UpdateClientRateNameDto } from './dto/update-client-rate-name.dto';

@UseFilters(new HttpExceptionFilter())
@UseGuards(RolesAuthGuard)
@UseInterceptors(CacheInterceptor)
@Controller('api/clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  async create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req: RequestWithAdmin) {
    return this.clientsService.findAll(req.admin.role);
  }

  @RolesAuth(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  @Get('unauthorized')
  async findUnauthorized() {
    return this.clientsService.findUnauthorized();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.clientsService.findOne(Number(id));
  }

  @RolesAuth(AdminRoles.SUPER_ADMIN)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientsService.update(Number(id), updateClientDto);
  }

  @RolesAuth(AdminRoles.SUPER_ADMIN)
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
    return this.clientsService.changeState(changeStateClientDto, req.admin.role);
  }

  @Post('feedback')
  async setClientFeedback(@Body() feedbackClientDto: FeedbackClientDto) {
    return this.clientsService.setClientFeedback(feedbackClientDto);
  }

  @Post('rate')
  async updateClientRate(@Body() { telegramId }: UpdateClientRateDto) {
    return this.clientsService.updateClientRate(telegramId, {});
  }

  @RolesAuth(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  @Post('rate/name')
  async updateClientRateName(@Body() updateClientRateNameDto: UpdateClientRateNameDto) {
    return this.clientsService.updateClientRateName(updateClientRateNameDto);
  }

  @RolesAuth(AdminRoles.SUPER_ADMIN)
  @Post('mailing')
  async clientsMailing(@Body() clientsMailingDto: ClientsMailingDto) {
    return this.clientsService.clientsMailing(clientsMailingDto);
  }
}
