import { Body, Controller, Get, Post, UseFilters, UseGuards } from '@nestjs/common';
import { HttpExceptionFilter } from 'src/common/exceptions';

import { AdminRoles } from '../admins/constants';
import { RolesAuth } from '../auth/decorators';
import { RolesAuthGuard } from '../auth/guard';
import { CreateModelDto } from './dto/create-model.dto';
import { GptService } from './gpt.service';

@UseFilters(new HttpExceptionFilter())
@UseGuards(RolesAuthGuard)
@Controller('api/gpt')
export class GptController {
  constructor(private readonly gptService: GptService) {}

  @RolesAuth(AdminRoles.SUPER_ADMIN)
  @Post('models')
  async createModel(@Body() createModelDto: CreateModelDto) {
    return this.gptService.createModel(createModelDto);
  }

  @Get('models')
  async findAll() {
    return this.gptService.findAll();
  }
}
