import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HttpStatusCode } from 'axios';
import { Model } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { Image as ImageAi } from 'openai/resources';
import { getTranslation } from 'src/common/helpers';
import { getAvailableLocale, isExpiredDate, removeFile } from 'src/common/utils';
import { v4 as uuidv4 } from 'uuid';

import { ClientsService } from '../clients/clients.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { OpenAiService } from '../openai/openai.service';
import { SberService } from '../sber/sber.service';
import { TelegramService } from '../telegram/telegram.service';
import { ModelGPT, ModelImage, ModelSpeech } from './constants';
import { ChatCompletionDto } from './dto/chat-completion.dto';
import { CreateModelDto } from './dto/create-model.dto';
import { GenerateImagesDto } from './dto/generate-images.dto';
import { GetModelsDto } from './dto/get-models.dto';
import { GetTranslationDto } from './dto/get-translation.dto';
import { GptModels } from './schemas';
import { ChatCompletions, ImagesGenerate, Transcriptions } from './types';

@Injectable()
export class GptService {
  constructor(
    @InjectModel(GptModels.name) private readonly gptModels: Model<GptModels>,
    private readonly clientsService: ClientsService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly i18n: I18nService,
    private readonly openAiService: OpenAiService,
    private readonly sberService: SberService,
    private readonly telegramService: TelegramService,
  ) {}

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

    const {
      rate: { gptModels: clientModels },
    } = await this.clientsService.availability(telegramId);

    return this.gptModels.find({ model: { $in: clientModels } }).exec();
  }

  async chatCompletions(chatCompletionsDto: ChatCompletionDto): Promise<ChatCompletions | null> {
    const { messages, messageId, model, telegramId } = chatCompletionsDto;

    let chatCompletionsResponse = { message: null, usage: null };

    try {
      const { rate } = await this.clientsService.availability(telegramId);

      if (!isExpiredDate(rate.expiresAt) && !rate.gptTokens) {
        throw new BadRequestException(`All tokens for the ${telegramId} have been used up`);
      }

      const isModelExist = await this.gptModels.findOne({ model }).exec();

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

      if (model === ModelGPT.GIGA_CHAT) {
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

        const clientRate = await this.clientsService.updateClientRate(telegramId, {
          usedTokens: chatCompletionsResponse.usage.total_tokens,
        });

        return { ...chatCompletionsResponse, clientRate };
      }

      return null;
    } catch (error) {
      console.log(error);
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
      const { rate } = await this.clientsService.availability(telegramId);

      if (!isExpiredDate(rate.expiresAt) && !rate.gptTokens) {
        throw new BadRequestException(`All tokens for the ${telegramId} have been used up`);
      }

      const isModelExist = await this.gptModels.findOne({ model }).exec();

      if (!isModelExist) {
        throw new NotFoundException(`${model} not found`);
      }

      const { filePath, duration } = await this.telegramService.getFile(filename, telegramId);

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
      const { rate, languageCode } = await this.clientsService.findOne(telegramId);

      if (!isExpiredDate(rate.expiresAt) && !rate.images) {
        throw new BadRequestException(`All images for the ${telegramId} have been used up`);
      }

      const isModelExist = await this.gptModels.findOne({ model }).exec();

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

      if (imagesFromAi.length > 0) {
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
          urls: imagesFromAi.map(({ url }) => url),
          prompt,
          revisedPrompt,
        });

        const clientRate = await this.clientsService.updateClientRate(telegramId, {
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
          clientRate,
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
