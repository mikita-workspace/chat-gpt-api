import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { AxiosError } from 'axios';
import { Cache as CacheManager } from 'cache-manager';
import { createReadStream } from 'fs';
import * as https from 'https';
import { Model } from 'mongoose';
import { OpenAI } from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';
import { catchError, firstValueFrom } from 'rxjs';
import { expiresIn, removeFile } from 'src/common/utils';

import { TelegramService } from '../telegram/telegram.service';
import {
  GIGA_CHAT,
  GIGA_CHAT_ACCESS_TOKEN,
  GIGA_CHAT_OAUTH,
  GIGACHAT_API_PERS,
  ModelGPT,
} from './constants';
import { CreateModelDto } from './dto/create-model.dto';
import { GetTranslationDto } from './dto/get-translation.dto';
import { GptModels } from './schemas';
import { ChatCompletions } from './types';

@Injectable()
export class GptService {
  private openAI: OpenAI;

  constructor(
    @InjectModel(GptModels.name) private readonly gptModels: Model<GptModels>,
    @Inject(TelegramService) private readonly telegramService: TelegramService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: CacheManager,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.openAI = new OpenAI({
      apiKey: configService.get('openAi.token'),
      organization: configService.get('openAi.organization'),
    });
  }

  private async getAccessTokenGigaChat() {
    const cachedAccessToken = await this.cacheManager.get(GIGA_CHAT_ACCESS_TOKEN);

    if (cachedAccessToken) {
      return cachedAccessToken;
    }

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      RqUID: '6f0b1291-c7f3-43c6-bb2e-9f3efb2dc98e',
      Authorization: `Bearer ${this.configService.get('sber.token')}`,
    };

    const { data } = await firstValueFrom(
      this.httpService
        .post(
          GIGA_CHAT_OAUTH,
          { scope: GIGACHAT_API_PERS },
          {
            headers,
            // NOTE: TLS certificate is disabled
            httpsAgent: new https.Agent({
              rejectUnauthorized: false,
            }),
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            throw new BadRequestException(error.response.data);
          }),
        ),
    );

    await this.cacheManager.set(
      GIGA_CHAT_ACCESS_TOKEN,
      data.access_token,
      expiresIn(data.expires_at),
    );

    return data.access_token;
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
        const accessToken = this.getAccessTokenGigaChat();

        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          'X-Request-ID': '79e41a5f-f180-4c7a-b2d9-393086ae20a1',
          'X-Session-ID': 'b6874da0-bf06-410b-a150-fd5f9164a0b2',
          'X-Client-ID': 'b6874da0-bf06-410b-a150-fd5f9164a0b2',
        };

        const { data: chatCompletion } = await firstValueFrom(
          this.httpService
            .post(
              `${GIGA_CHAT}/chat/completions`,
              {
                max_tokens: 512,
                messages,
                model,
                n: 1,
                repetition_penalty: 1.07,
                stream: false,
                temperature: 0.87,
                top_p: 0.47,
                update_interval: 0,
              },
              {
                headers,
                // NOTE: TLS certificate is disabled
                httpsAgent: new https.Agent({
                  rejectUnauthorized: false,
                }),
              },
            )
            .pipe(
              catchError((error: AxiosError) => {
                throw new BadRequestException(error.response.data);
              }),
            ),
        );

        return { message: chatCompletion.choices[0].message, usage: chatCompletion.usage };
      }

      return null;
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        throw new BadRequestException(error);
      }

      throw new BadRequestException();
    }
  }

  async transcriptions(getTranslationDto: GetTranslationDto) {
    const { voicePathApi, telegramId } = getTranslationDto;

    const mp3Path = await this.telegramService.downloadVoiceMessage(voicePathApi, telegramId);

    try {
      const transcription = await this.openAI.audio.transcriptions.create({
        model: ModelGPT.WHISPER_1,
        file: createReadStream(mp3Path),
      });

      await removeFile(mp3Path);

      return transcription.text;
    } catch (error) {
      console.log(error);
      if (error instanceof OpenAI.APIError) {
        throw new BadRequestException(error);
      }

      throw new BadRequestException();
    }
  }

  async imagesGenerate() {
    // const response = await this.openAI.images.generate({
    //   n: Math.min(MAX_IMAGES_REQUEST, numberOfImages <= 0 ? 1 : numberOfImages),
    //   prompt,
    //   response_format: 'b64_json',
    //   size: IMAGE_SIZE_DEFAULT,
    // });
    // return response.data.data;
  }
}
