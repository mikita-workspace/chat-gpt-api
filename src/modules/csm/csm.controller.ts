import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { TTL_CONFIG_CACHE_MS } from '@/common/constants';

import { AdminRole } from '../admins/constants';
import { RolesAuth } from '../auth/decorators';
import { JwtAuthGuard, RolesAuthGuard } from '../auth/guard';
import { CsmService } from './csm.service';
import { CsmTopicService } from './csm-topic.service';
import { CreateCsmDto } from './dto/create-csm.dto';
import { CreateCsmTopicDto } from './dto/create-csm-topic.dto';
import { UpdateCsmDto } from './dto/update-csm.dto';
import { UpdateCsmTopicDto } from './dto/update-csm-topic.dto';

@UseGuards(RolesAuthGuard)
@UseInterceptors(CacheInterceptor)
@Controller('csm')
export class CsmController {
  constructor(
    private readonly csmService: CsmService,
    private readonly csmTopicService: CsmTopicService,
  ) {}

  @Post()
  async create(@Body() createCsmDto: CreateCsmDto) {
    return this.csmService.create(createCsmDto);
  }

  @RolesAuth(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @Post('topic')
  async createTopic(@Body() createCsmTopicDto: CreateCsmTopicDto) {
    return this.csmTopicService.create(createCsmTopicDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return this.csmService.findAll();
  }

  @CacheTTL(TTL_CONFIG_CACHE_MS)
  @Get('topic')
  async findTopicAll() {
    return this.csmTopicService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':ticketNumber')
  async findOne(@Param('ticketNumber') ticketNumber: string) {
    return this.csmService.findOne(ticketNumber);
  }

  @UseGuards(JwtAuthGuard)
  @Get('topic/:key')
  async findTopicOne(@Param('key') key: string) {
    return this.csmTopicService.findOne(key);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':ticketNumber')
  async update(@Param('ticketNumber') ticketNumber: string, @Body() updateCsmDto: UpdateCsmDto) {
    return this.csmService.update(ticketNumber, updateCsmDto);
  }

  @RolesAuth(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @Patch('topic/:key')
  async updateTopic(@Param('key') key: string, @Body() updateCsmTopicDto: UpdateCsmTopicDto) {
    return this.csmTopicService.update(key, updateCsmTopicDto);
  }

  @RolesAuth(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @Delete(':ticketNumber')
  async remove(@Param('ticketNumber') ticketNumber: string) {
    return this.csmService.remove(ticketNumber);
  }

  @RolesAuth(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @Delete('topic/:key')
  async removeTopic(@Param('key') key: string) {
    return this.csmTopicService.remove(key);
  }
}
