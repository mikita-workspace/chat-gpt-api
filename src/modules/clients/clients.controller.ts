import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { HttpExceptionFilter } from 'src/common/exceptions';

import { AdminRoles } from '../admins/constants';
import { RolesAuth } from '../auth/decorators';
import { JwtAuthGuard, RolesAuthGuard } from '../auth/guard';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@UseFilters(new HttpExceptionFilter())
@UseGuards(RolesAuthGuard)
@Controller('api/clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @RolesAuth(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  @Post()
  async create(@Body() createClientDto: CreateClientDto) {
    const client = await this.clientsService.findOneByTelegramId(createClientDto.telegramId);

    if (client) {
      throw new ConflictException(`${createClientDto.telegramId} already exist`);
    }

    return this.clientsService.create(createClientDto);
  }

  @RolesAuth(AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN)
  @Get()
  async findAll() {
    return this.clientsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const client = await this.clientsService.findOne(id);

    if (!client) {
      throw new NotFoundException(`${id} not found`);
    }

    return client;
  }

  @UseGuards(JwtAuthGuard)
  @Get('telegram/:id')
  async findOneByEmail(@Param('id') id: string) {
    const client = await this.clientsService.findOneByTelegramId(Number(id));

    if (!client) {
      throw new NotFoundException(`${id} not found`);
    }

    return client;
  }

  @RolesAuth(AdminRoles.SUPER_ADMIN)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    const client = await this.clientsService.findOne(id);

    if (!client) {
      throw new NotFoundException(`${id} not found`);
    }

    return this.clientsService.update(id, updateClientDto);
  }

  @RolesAuth(AdminRoles.SUPER_ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const client = await this.clientsService.findOne(id);

    if (!client) {
      throw new NotFoundException(`${id} not found`);
    }

    return this.clientsService.remove(id);
  }
}
