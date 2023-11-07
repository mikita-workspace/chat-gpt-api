import {
  Body,
  ConflictException,
  Controller,
  // Delete,
  Get,
  // Param,
  // Patch,
  Post,
  UseFilters,
} from '@nestjs/common';
import { HttpExceptionFilter } from 'src/common/exceptions';

import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
// import { UpdateClientDto } from './dto/update-client.dto';

@UseFilters(new HttpExceptionFilter())
@Controller('api/clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  async create(@Body() createClientDto: CreateClientDto) {
    const client = await this.clientsService.findOneByTelegramId(createClientDto.telegramId);

    if (client) {
      throw new ConflictException(`${createClientDto.telegramId} already exist`);
    }

    return this.clientsService.create(createClientDto);
  }

  @Get()
  async findAll() {
    return this.clientsService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.clientsService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
  //   return this.clientsService.update(+id, updateClientDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.clientsService.remove(+id);
  // }
}
