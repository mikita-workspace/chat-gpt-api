import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import { AdminRoles } from '../admins/constants';
import { RolesAuth } from '../auth/decorators';
import { RolesAuthGuard } from '../auth/guard';
import { ChatCompletionDto } from './dto/chat-completion.dto';
import { CreateModelDto } from './dto/create-model.dto';
import { GenerateImagesDto } from './dto/generate-images.dto';
import { GetModelsDto } from './dto/get-models.dto';
import { GetTranslationDto } from './dto/get-translation.dto';
import { GptService } from './gpt.service';

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
  async findAll(@Body() getModelsDto: GetModelsDto) {
    return this.gptService.findAll(getModelsDto);
  }

  @Post('transcriptions')
  async transcriptions(@Body() getTranslationDto: GetTranslationDto) {
    return this.gptService.transcriptions(getTranslationDto);
  }

  @Post('chatCompletions')
  async chatCompletions(@Body() chatCompletionDto: ChatCompletionDto) {
    return this.gptService.chatCompletions(chatCompletionDto);
  }

  @Post('generateImages')
  async generateImages(@Body() generateImagesDto: GenerateImagesDto) {
    return this.gptService.generateImages(generateImagesDto);
  }
}
