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
import { UpdateClientDto } from './dto/update-client.dto';

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
  async giveClientFeedback(@Body() feedbackClientDto: FeedbackClientDto) {
    return this.clientsService.giveClientFeedback(feedbackClientDto);
  }
}
