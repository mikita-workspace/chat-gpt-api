import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OpenAI } from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';

import { ModelGPT } from './constants';
import { CreateModelDto } from './dto/create-model.dto';
import { GptModels } from './schemas';
import { ChatCompletions } from './types/gpt.types';

@Injectable()
export class GptService {
  private openAI: OpenAI;

  constructor(
    @InjectModel(GptModels.name) private readonly gptModels: Model<GptModels>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.openAI = new OpenAI({
      apiKey: configService.get('openAi.token'),
      organization: configService.get('openAi.organization'),
    });
  }

  async createModel(createModelDto: CreateModelDto): Promise<GptModels> {
    const { model } = createModelDto;

    const isModelExist = await this.gptModels.findOne({ model });

    if (isModelExist) {
      throw new ConflictException(`${model} already exist`);
    }

    return new this.gptModels(createModelDto).save();
  }

  async findAll(): Promise<GptModels[]> {
    return this.gptModels.find().exec();
  }

  async chatCompletions(
    messages: ChatCompletionMessageParam[],
    model = ModelGPT.GPT_3_5_TURBO,
  ): Promise<ChatCompletions | null> {
    try {
      const isModelExist = this.gptModels.findOne({ model });

      if (!isModelExist) {
        throw new NotFoundException(`${model} not found`);
      }

      if (model === ModelGPT.GPT_3_5_TURBO) {
        const chatCompletion = await this.openAI.chat.completions.create({
          messages,
          model,
          top_p: 0.5,
        });

        return { message: chatCompletion.choices[0].message, usage: chatCompletion.usage };
      }

      if (model === ModelGPT.GIGA_CHAT) {
        return null;
      }

      return null;
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        throw new BadRequestException(error);
      } else {
        throw new BadRequestException();
      }
    }
  }
}
