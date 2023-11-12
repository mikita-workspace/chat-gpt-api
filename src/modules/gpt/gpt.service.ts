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
import { AxiosError, HttpStatusCode } from 'axios';
import { Cache as CacheManager } from 'cache-manager';
import { v2 as CloudStorage } from 'cloudinary';
import { createReadStream } from 'fs';
import * as https from 'https';
import { Model } from 'mongoose';
import { OpenAI } from 'openai';
import { Image as ImageAi } from 'openai/resources';
import { catchError, firstValueFrom } from 'rxjs';
import { expiresInMs, removeFile } from 'src/common/utils';
import { v4 as uuidv4 } from 'uuid';

import { ClientsService } from '../clients/clients.service';
import { TelegramService } from '../telegram/telegram.service';
import {
  GIGA_CHAT,
  GIGA_CHAT_ACCESS_TOKEN,
  GIGA_CHAT_OAUTH,
  GIGACHAT_API_PERS,
  IMAGE_SIZE_HEIGHT_DEFAULT,
  IMAGE_SIZE_WIDTH_DEFAULT,
  ModelGPT,
  ModelImage,
  ModelSpeech,
} from './constants';
import { ChatCompletionDto } from './dto/chat-completion.dto';
import { CreateModelDto } from './dto/create-model.dto';
import { GenerateImagesDto } from './dto/generate-images.dto';
import { GetModelsDto } from './dto/get-models.dto';
import { GetTranslationDto } from './dto/get-translation.dto';
import { GptModels } from './schemas';
import { ChatCompletions, ImagesGenerate } from './types';

@Injectable()
export class GptService {
  private openAI: OpenAI;

  constructor(
    @InjectModel(GptModels.name) private readonly gptModels: Model<GptModels>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: CacheManager,
    @Inject(TelegramService) private readonly telegramService: TelegramService,
    private readonly clientsService: ClientsService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.openAI = new OpenAI({
      apiKey: configService.get('openAi.token'),
      organization: configService.get('openAi.organization'),
    });

    CloudStorage.config({
      api_key: configService.get('cloudinary.apiKey'),
      api_secret: configService.get('cloudinary.apiSecret'),
      cloud_name: configService.get('cloudinary.cloudName'),
      secure: true,
    });
  }

  private async getAccessTokenSber() {
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
      expiresInMs(data.expires_at),
    );

    return data.access_token;
  }

  async createModel(createModelDto: CreateModelDto): Promise<GptModels> {
    const { model } = createModelDto;

    const isModelExist = await this.gptModels.findOne({ model }).exec();

    if (isModelExist) {
      throw new ConflictException(`${model} already exist`);
    }

    return new this.gptModels(createModelDto).save();
  }

  async findAll(getModelsDto: GetModelsDto): Promise<GptModels[]> {
    const { telegramId } = getModelsDto;

    const { models: clientModels } = await this.clientsService.availability(telegramId);

    return this.gptModels.find({ model: { $in: clientModels } }).exec();
  }

  async chatCompletions(chatCompletionsDto: ChatCompletionDto): Promise<ChatCompletions | null> {
    const { messages, messageId, model, telegramId } = chatCompletionsDto;

    let chatCompletionsResponse = { message: null, usage: null };

    try {
      const isModelExist = await this.gptModels.findOne({ model }).exec();

      if (!isModelExist) {
        throw new NotFoundException(`${model} not found`);
      }

      if (model === ModelGPT.GPT_3_5_TURBO) {
        const chatCompletion = await this.openAI.chat.completions.create({
          messages,
          model,
          top_p: 0.5,
        });

        chatCompletionsResponse = {
          message: chatCompletion.choices[0].message,
          usage: chatCompletion.usage,
        };
      }

      if (model === ModelGPT.GIGA_CHAT) {
        const accessToken = await this.getAccessTokenSber();

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

        chatCompletionsResponse = {
          message: chatCompletion.choices[0].message,
          usage: chatCompletion.usage,
        };
      }

      const clientMessage = messages.slice(-1)[0];
      const assistantMessage = chatCompletionsResponse.message;

      if (clientMessage && assistantMessage) {
        await this.clientsService.updateClientMessages(telegramId, messageId, [
          clientMessage,
          assistantMessage,
        ]);

        const clientRate = await this.clientsService.updateClientRate(telegramId, {
          usedTokens: chatCompletionsResponse.usage.total_tokens,
        });

        return { ...chatCompletionsResponse, clientRate };
      }

      return null;
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        throw new BadRequestException(error);
      }
      const statusCode = error?.response?.statusCode;

      if (statusCode && statusCode === HttpStatusCode.NotFound) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  async transcriptions(getTranslationDto: GetTranslationDto): Promise<string | null> {
    const { voicePathApi, telegramId, model } = getTranslationDto;

    try {
      const isModelExist = await this.gptModels.findOne({ model }).exec();

      if (!isModelExist) {
        throw new NotFoundException(`${model} not found`);
      }

      const mp3Path = await this.telegramService.downloadVoiceMessage(voicePathApi, telegramId);

      if (model === ModelSpeech.WHISPER_1) {
        const transcription = await this.openAI.audio.transcriptions.create({
          model,
          file: createReadStream(mp3Path),
        });

        await removeFile(mp3Path);

        return transcription.text;
      }

      // TODO: New model will be added here: https://app.asana.com/0/1205877070000801/1205932083359511/f
      if (model === ModelSpeech.GENERAL) {
        return null;
      }

      return null;
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        throw new BadRequestException(error);
      }

      const statusCode = error?.response?.statusCode;

      if (statusCode && statusCode === HttpStatusCode.NotFound) {
        throw new NotFoundException(error.message);
      }

      throw new BadRequestException(error.message);
    }
  }

  async imagesGenerate(generateImagesDto: GenerateImagesDto): Promise<ImagesGenerate | null> {
    const {
      telegramId,
      messageId,
      model,
      amount,
      prompt,
      useCloudinary = false,
    } = generateImagesDto;

    try {
      const isModelExist = await this.gptModels.findOne({ model }).exec();

      if (!isModelExist) {
        throw new NotFoundException(`${model} not found`);
      }

      let imagesFromAi: ImageAi[] = [];
      let images: ImagesGenerate['images'] = [];

      if (model === ModelImage.DALL_E_3) {
        const response = await this.openAI.images.generate({
          model,
          n: amount,
          prompt,
          response_format: useCloudinary ? 'b64_json' : 'url',
          size: `${IMAGE_SIZE_HEIGHT_DEFAULT}x${IMAGE_SIZE_WIDTH_DEFAULT}`,
        });

        imagesFromAi = response.data;
        // TEST
        // imagesFromAi = [
        //   {
        //     url: 'https://www.seiu1000.org/sites/main/files/imagecache/hero/main-images/camera_lense_0.jpeg',
        //     revised_prompt:
        //       'Voluptate ut est tempor ea. Quis id mollit excepteur excepteur ut irure est minim qui exercitation adipisicing. Cillum magna duis ex duis amet aliqua irure anim labore minim. Labore minim dolor adipisicing aute aute esse et reprehenderit consectetur sint officia consequat. Esse officia culpa enim quis cillum ad tempor duis cupidatat mollit. Ullamco ea amet esse pariatur deserunt dolore aliquip id sint officia non quis ea occaecat. Dolor veniam dolore adipisicing non voluptate.',
        //   },
        //   {
        //     url: 'https://www.seiu1000.org/sites/main/files/imagecache/hero/main-images/camera_lense_0.jpeg',
        //     revised_prompt:
        //       'Voluptate ut est tempor ea. Quis id mollit excepteur excepteur ut irure est minim qui exercitation adipisicing. Cillum magna duis ex duis amet aliqua irure anim labore minim. Labore minim dolor adipisicing aute aute esse et reprehenderit consectetur sint officia consequat. Esse officia culpa enim quis cillum ad tempor duis cupidatat mollit. Ullamco ea amet esse pariatur deserunt dolore aliquip id sint officia non quis ea occaecat. Dolor veniam dolore adipisicing non voluptate.',
        //   },
        //   {
        //     url: 'https://www.seiu1000.org/sites/main/files/imagecache/hero/main-images/camera_lense_0.jpeg',
        //     revised_prompt:
        //       'Voluptate ut est tempor ea. Quis id mollit excepteur excepteur ut irure est minim qui exercitation adipisicing. Cillum magna duis ex duis amet aliqua irure anim labore minim. Labore minim dolor adipisicing aute aute esse et reprehenderit consectetur sint officia consequat. Esse officia culpa enim quis cillum ad tempor duis cupidatat mollit. Ullamco ea amet esse pariatur deserunt dolore aliquip id sint officia non quis ea occaecat. Dolor veniam dolore adipisicing non voluptate.',
        //   },
        // ];
      }

      if (imagesFromAi.length > 0) {
        if (useCloudinary) {
          const cloudStorageRequests = imagesFromAi.map((image) =>
            CloudStorage.uploader.upload(`data:image/jpeg;base64,${image.b64_json}`, {
              resource_type: 'image',
              folder: `images/${telegramId}`,
              public_id: `${telegramId}-${model}-${uuidv4()}`,
            }),
          );

          const cloudStorageResponses = await Promise.all(cloudStorageRequests);

          images = cloudStorageResponses.map((response) => ({
            bytes: response.bytes,
            height: response.height,
            url: response.url,
            width: response.width,
          }));
        } else {
          images = imagesFromAi.map((response) => ({
            bytes: null,
            height: IMAGE_SIZE_HEIGHT_DEFAULT,
            url: response.url,
            width: IMAGE_SIZE_WIDTH_DEFAULT,
          }));
        }

        const revisedPrompt = imagesFromAi[0].revised_prompt;

        await this.clientsService.updateClientImages(telegramId, messageId, {
          urls: imagesFromAi.map(({ url }) => url),
          prompt,
          revisedPrompt,
        });

        const clientRate = await this.clientsService.updateClientRate(telegramId, {
          usedImages: imagesFromAi.length,
        });

        return {
          clientRate,
          images,
          revisedPrompt,
        };
      }

      return null;
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        throw new BadRequestException(error);
      }

      const statusCode = error?.response?.statusCode;

      if (statusCode && statusCode === HttpStatusCode.NotFound) {
        throw new NotFoundException(error.message);
      }

      throw new BadRequestException(error.message);
    }
  }
}
