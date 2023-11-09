import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  Body,
  Controller,
  Get,
  Post,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { HttpExceptionFilter } from 'src/common/exceptions';

import { AdminRoles } from '../admins/constants';
import { RolesAuth } from '../auth/decorators';
import { RolesAuthGuard } from '../auth/guard';
import { ChatCompletionDto } from './dto/chat-completion.dto';
import { CreateModelDto } from './dto/create-model.dto';
import { GetTranslationDto } from './dto/get-translation.dto';
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

  @UseInterceptors(CacheInterceptor)
  @Get('models')
  async findAll() {
    return this.gptService.findAll();
  }

  @Post('transcriptions')
  async transcriptions(@Body() getTranslationDto: GetTranslationDto) {
    return this.gptService.transcriptions(getTranslationDto);
  }

  @Post('chatCompletions')
  async chatCompletions(@Body() chatCompletionDto: ChatCompletionDto) {
    return this.gptService.chatCompletions(chatCompletionDto);
  }
}
