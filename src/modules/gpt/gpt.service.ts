import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GptModel } from '@prisma/client';
import { HttpStatusCode } from 'axios';
import { Cache as CacheManager } from 'cache-manager';
import { readFile } from 'fs/promises';
import { I18nService } from 'nestjs-i18n';
import { ChatCompletionUserMessageParam, Image as ImageAi } from 'openai/resources';
import { v4 as uuidv4 } from 'uuid';

import { getTranslation } from '@/common/helpers';
import { getAvailableLocale, isExpiredDate, removeFile } from '@/common/utils';
import { PrismaService } from '@/database';

import { ClientsService } from '../clients/clients.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { OpenAiService } from '../openai/openai.service';
import { SberService } from '../sber/sber.service';
import { TelegramService } from '../telegram/telegram.service';
import {
  GET_GPT_MODELS_CACHE_KEY,
  ModelGPT,
  ModelImage,
  ModelSpeech,
  ModelVision,
} from './constants';
import { ChatCompletionDto } from './dto/chat-completion.dto';
import { CreateModelDto } from './dto/create-model.dto';
import { GenerateImagesDto } from './dto/generate-images.dto';
import { GetModelsDto } from './dto/get-models.dto';
import { GetTranslationDto } from './dto/get-translation.dto';
import { VisionCompletionDto } from './dto/vision-completion.dto';
import { ChatCompletions, ImagesGenerate, Transcriptions, VisionCompletions } from './types';

@Injectable()
export class GptService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: CacheManager,
    private readonly clientsService: ClientsService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly i18n: I18nService,
    private readonly openAiService: OpenAiService,
    private readonly prismaService: PrismaService,
    private readonly sberService: SberService,
    private readonly telegramService: TelegramService,
  ) {}

  async createModel(createModelDto: CreateModelDto) {
    const { model } = createModelDto;

    const isModelExist = await this.prismaService.gptModel.findFirst({ where: { model } });

    if (isModelExist) {
      throw new ConflictException(`${model} already exist`);
    }

    return await this.prismaService.gptModel.create({ data: createModelDto });
  }

  async findAll(getModelsDto: GetModelsDto) {
    const { telegramId } = getModelsDto;

    const cache = await this.cacheManager.get<GptModel[]>(
      `${GET_GPT_MODELS_CACHE_KEY}-${telegramId}`,
    );

    if (cache) {
      return cache;
    }

    const {
      accountLevel: { gptModels: clientModels },
    } = await this.clientsService.availability(telegramId);

    const models = await this.prismaService.gptModel.findMany({
      where: { model: { in: clientModels } },
      orderBy: {
        creator: 'asc',
      },
    });

    await this.cacheManager.set(`${GET_GPT_MODELS_CACHE_KEY}-${telegramId}`, models);

    return models;
  }

  async chatCompletions(chatCompletionsDto: ChatCompletionDto): Promise<ChatCompletions | null> {
    const { messages, messageId, model, telegramId } = chatCompletionsDto;

    let chatCompletionsResponse = { message: null, usage: null };

    try {
      const { accountLevel } = await this.clientsService.availability(telegramId);

      if (!isExpiredDate(accountLevel.expiresAt) && !accountLevel.gptTokens) {
        throw new BadRequestException(`All tokens for the ${telegramId} have been used up`);
      }

      const isModelExist = await this.prismaService.gptModel.findFirst({ where: { model } });

      if (!isModelExist) {
        throw new NotFoundException(`${model} not found`);
      }

      if ([ModelGPT.GPT_3_5_TURBO, ModelGPT.GPT_4_TURBO].includes(model as ModelGPT)) {
        const completion = await this.openAiService.completions(messages, { model });

        chatCompletionsResponse = {
          message: completion.choices[0].message,
          usage: completion.usage,
        };
      }

      if ([ModelGPT.GIGA_CHAT, ModelGPT.GIGA_CHAT_PRO].includes(model as ModelGPT)) {
        const completion = await this.sberService.completions(messages, { model });

        chatCompletionsResponse = {
          message: completion.choices[0].message,
          usage: completion.usage,
        };
      }

      const clientMessage = messages.slice(-1)[0];
      const assistantMessage = chatCompletionsResponse.message;

      if (clientMessage && assistantMessage) {
        await this.clientsService.updateClientMessages(telegramId, messageId, [
          clientMessage,
          assistantMessage,
        ]);

        const clientAccountLevel = await this.clientsService.updateClientAccountLevel(telegramId, {
          usedTokens: chatCompletionsResponse.usage.total_tokens,
        });

        return { ...chatCompletionsResponse, clientAccountLevel };
      }

      return null;
    } catch (error) {
      const statusCode = error?.response?.statusCode;

      if (statusCode && statusCode === HttpStatusCode.NotFound) {
        throw new NotFoundException(error.message);
      }
    }
  }

  async visionCompletions(
    visionCompletionDto: VisionCompletionDto,
  ): Promise<VisionCompletions | null> {
    const {
      filename,
      message,
      messageId,
      model,
      telegramId,
      useCloudinary = false,
    } = visionCompletionDto;

    let visionCompletionsResponse = { message: null, usage: null };
    let cloudImages = [];

    try {
      const { accountLevel } = await this.clientsService.availability(telegramId);

      if (!isExpiredDate(accountLevel.expiresAt) && !accountLevel.gptTokens) {
        throw new BadRequestException(`All tokens for the ${telegramId} have been used up`);
      }

      const isModelExist = await this.prismaService.gptModel.findFirst({ where: { model } });

      if (!isModelExist) {
        throw new NotFoundException(`${model} not found`);
      }

      const { filePath } = await this.telegramService.getFileInJpg(filename, telegramId);

      const base64 = await readFile(filePath, { encoding: 'base64' });

      if (model === ModelVision.GPT_4_VISION) {
        const messages = [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: message,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64}`,
                },
              },
            ],
          },
        ] as ChatCompletionUserMessageParam[];

        const completion = await this.openAiService.visionCompletions(messages, { model });

        visionCompletionsResponse = {
          message: completion.choices[0].message,
          usage: completion.usage,
        };
      }

      if (useCloudinary) {
        const cloudinary = await this.cloudinaryService.uploadBase64([base64], {
          folder: `vision/${telegramId}`,
          public_id: `${telegramId}-${model}-${uuidv4()}`,
        });

        cloudImages = cloudinary;
      }

      await removeFile(filePath);

      const clientMessage = { role: 'user', content: message, url: cloudImages?.[0]?.url ?? null };
      const assistantMessage = visionCompletionsResponse.message;

      if (clientMessage && assistantMessage) {
        await this.clientsService.updateClientMessages(telegramId, messageId, [
          clientMessage,
          assistantMessage,
        ]);

        const clientAccountLevel = await this.clientsService.updateClientAccountLevel(telegramId, {
          usedTokens: visionCompletionsResponse.usage.total_tokens,
        });

        return { ...visionCompletionsResponse, clientAccountLevel };
      }

      return null;
    } catch (error) {
      const statusCode = error?.response?.statusCode;

      if (statusCode && statusCode === HttpStatusCode.NotFound) {
        throw new NotFoundException(error.message);
      }
    }
  }

  async transcriptions(getTranslationDto: GetTranslationDto): Promise<Transcriptions | null> {
    const { filename, telegramId, model } = getTranslationDto;

    let transcriptionResponse = { text: '' };

    try {
      const { accountLevel } = await this.clientsService.availability(telegramId);

      if (!isExpiredDate(accountLevel.expiresAt) && !accountLevel.gptTokens) {
        throw new BadRequestException(`All tokens for the ${telegramId} have been used up`);
      }

      const isModelExist = await this.prismaService.gptModel.findFirst({ where: { model } });

      if (!isModelExist) {
        throw new NotFoundException(`${model} not found`);
      }

      const { filePath, duration } = await this.telegramService.getFileInMp3(filename, telegramId);

      if (model === ModelSpeech.WHISPER_1) {
        const transcription = await this.openAiService.transcriptions(filePath, { model });

        transcriptionResponse = { text: transcription.text };
      }

      if (model === ModelSpeech.GENERAL) {
        const transcription = await this.sberService.transcriptions(filePath, { model, duration });

        transcriptionResponse = { text: transcription.text };
      }

      await removeFile(filePath);

      return transcriptionResponse;
    } catch (error) {
      const statusCode = error?.response?.statusCode;

      if (statusCode && statusCode === HttpStatusCode.NotFound) {
        throw new NotFoundException(error.message);
      }
    }
  }

  async generateImages(generateImagesDto: GenerateImagesDto): Promise<ImagesGenerate | null> {
    const {
      telegramId,
      messageId,
      model,
      amount,
      prompt,
      useCloudinary = false,
    } = generateImagesDto;

    try {
      const {
        accountLevel,
        metadata: { languageCode },
      } = await this.clientsService.findOne(telegramId);

      if (!isExpiredDate(accountLevel.expiresAt) && !accountLevel.images) {
        throw new BadRequestException(`All images for the ${telegramId} have been used up`);
      }

      const isModelExist = await this.prismaService.gptModel.findFirst({ where: { model } });

      if (!isModelExist) {
        throw new NotFoundException(`${model} not found`);
      }

      let imagesFromAi: ImageAi[] = [];
      let cloudImages: ImagesGenerate['images'] = [];

      let imagesResponse: ImagesGenerate['images'] = [];

      if ([ModelImage.DALL_E_2, ModelImage.DALL_E_3].includes(model as ModelImage)) {
        const images = await this.openAiService.images(prompt, amount, {
          model,
          responseFormat: useCloudinary ? 'b64_json' : 'url',
        });

        imagesFromAi = images;
      }

      if (imagesFromAi.length) {
        if (useCloudinary) {
          const base64s = imagesFromAi.map(({ b64_json }) => b64_json);

          const cloudinary = await this.cloudinaryService.uploadBase64(base64s, {
            folder: `images/${telegramId}`,
            public_id: `${telegramId}-${model}-${uuidv4()}`,
          });

          cloudImages = cloudinary;
        }

        imagesResponse = Boolean(cloudImages.length)
          ? cloudImages
          : imagesFromAi.map((response) => ({
              bytes: null,
              height: model === ModelImage.DALL_E_3 ? 1024 : 256,
              url: response.url,
              width: model === ModelImage.DALL_E_3 ? 1024 : 256,
            }));

        const revisedPrompt = imagesFromAi[0].revised_prompt;

        await this.clientsService.updateClientImages(telegramId, messageId, {
          urls: imagesResponse.map(({ url }) => url),
          prompt,
          revisedPrompt,
        });

        const clientAccountLevel = await this.clientsService.updateClientAccountLevel(telegramId, {
          usedImages: imagesFromAi.length,
        });

        const lang = getAvailableLocale(languageCode);
        const translate = revisedPrompt ? await getTranslation(revisedPrompt, lang) : '';

        const clientRevisedPrompt = translate
          ? `${translate.text}\n\r\n\r<b>${this.i18n.t('locale.client.translated-by', {
              lang,
            })} <a href="${translate.provider.url}">${translate.provider.name}</a></b>`
          : '';

        return {
          clientAccountLevel,
          images: imagesResponse,
          revisedPrompt: clientRevisedPrompt,
        };
      }

      return null;
    } catch (error) {
      const statusCode = error?.response?.statusCode;

      if (statusCode && statusCode === HttpStatusCode.NotFound) {
        throw new NotFoundException(error.message);
      }
    }
  }
}
