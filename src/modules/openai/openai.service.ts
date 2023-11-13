import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createReadStream } from 'fs';
import OpenAI from 'openai';
import { ChatCompletionMessageParam, ImageGenerateParams } from 'openai/resources';

import { ModelImage } from '../gpt/constants';

@Injectable()
export class OpenAiService {
  private openAI: OpenAI;

  constructor(private readonly configService: ConfigService) {
    this.openAI = new OpenAI({
      apiKey: configService.get('openAi.token'),
      organization: configService.get('openAi.organization'),
    });
  }

  async completions(messages: ChatCompletionMessageParam[], options: { model: string }) {
    const { model } = options;

    try {
      const completion = await this.openAI.chat.completions.create({
        messages,
        model,
        top_p: 0.5,
      });

      return completion;
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        throw new BadRequestException(error.message);
      }
    }
  }

  async transcriptions(filePath: string, options: { model: string }) {
    const { model } = options;

    try {
      const data = await this.openAI.audio.transcriptions.create({
        model,
        file: createReadStream(filePath),
      });

      return data;
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        throw new BadRequestException(error.message);
      }
    }
  }

  async images(
    prompt: string,
    amount = 1,
    options: { model: string; responseFormat: ImageGenerateParams['response_format'] },
  ) {
    const { model, responseFormat } = options;

    try {
      const { data } = await this.openAI.images.generate({
        model,
        n: model === ModelImage.DALL_E_3 ? 1 : amount,
        prompt,
        response_format: responseFormat,
        size: model === ModelImage.DALL_E_3 ? '1024x1024' : '256x256',
      });

      return data;
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        throw new BadRequestException(error.message);
      }
    }
  }
}
