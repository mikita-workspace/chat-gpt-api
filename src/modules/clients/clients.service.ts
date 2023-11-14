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
import { HttpStatusCode } from 'axios';
import { Cache as CacheManager } from 'cache-manager';
import { differenceInCalendarDays } from 'date-fns';
import { Model } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { ChatCompletionMessage } from 'openai/resources/chat';
import { MONTH_IN_DAYS } from 'src/common/constants';
import { getTranslation } from 'src/common/helpers';
import {
  copyObject,
  expiresInMs,
  fromMsToMins,
  getAvailableLocale,
  getTimestampPlusDays,
  getTimestampUnix,
  isBoolean,
  isExpiredDate,
} from 'src/common/utils';
import { v4 as uuidv4 } from 'uuid';

import { AdminRoles } from '../admins/constants';
import {
  GET_GPT_MODELS_CACHE_KEY,
  gptModelsBase,
  gptModelsPremium,
  gptModelsPromo,
} from '../gpt/constants';
import { TelegramService } from '../telegram/telegram.service';
import {
  ClientFeedback,
  ClientImagesRate,
  ClientNamesRate,
  ClientSymbolRate,
  ClientTokensRate,
} from './constants';
import { ChangeStateClientDto } from './dto/change-state-client.dto';
import { CreateClientDto } from './dto/create-client.dto';
import { FeedbackClientDto } from './dto/feedback-client.dto';
import { ClientsMailingDto } from './dto/mailing-clients.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { UpdateClientRateNameDto } from './dto/update-client-rate-name.dto';
import { Client, ClientImages, ClientMessages } from './schemas';

@Injectable()
export class ClientsService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: CacheManager,
    @InjectModel(Client.name) private readonly clientModel: Model<Client>,
    @InjectModel(ClientMessages.name) private readonly clientMessagesModel: Model<ClientMessages>,
    @InjectModel(ClientImages.name) private readonly clientImagesModel: Model<ClientImages>,
    private readonly telegramService: TelegramService,
    private readonly i18n: I18nService,
    private readonly configService: ConfigService,
  ) {}

  async create(createClientDto: CreateClientDto): Promise<Partial<Client>> {
    const { telegramId, languageCode, metadata } = createClientDto;

    const client = await this.clientModel.findOne({ telegramId }).exec();

    if (client) {
      throw new ConflictException(`${telegramId} already exist`);
    }

    const newClientMessages = await this.clientMessagesModel.create({
      telegramId,
      clientMessagesId: uuidv4(),
    });

    const newClientImages = await this.clientImagesModel.create({
      telegramId,
      clientImagesId: uuidv4(),
    });

    const newClient = new this.clientModel({ languageCode, telegramId, metadata });

    newClient.set('messages', newClientMessages._id);
    newClient.set('images', newClientImages._id);

    await newClient.save();

    return {
      createdAt: newClient.createdAt,
      languageCode: newClient.languageCode,
      telegramId: newClient.telegramId,
      metadata: newClient.metadata,
    };
  }

  async findAll(role: `${AdminRoles}`): Promise<Client[]> {
    const filter = role === AdminRoles.MODERATOR ? { 'state.isApproved': true } : {};

    return this.clientModel.find(filter).exec();
  }

  async findUnauthorized() {
    return this.clientModel
      .find({
        'state.isApproved': false,
      })
      .exec();
  }

  async findOne(telegramId: number): Promise<Client> {
    if (Number.isNaN(telegramId)) {
      throw new BadRequestException('The Telegram ID does not match the numeric type');
    }

    const client = await this.clientModel.findOne({ telegramId }).exec();

    if (!client) {
      throw new NotFoundException(`${telegramId} not found`);
    }

    return client;
  }

  async update(telegramId: number, updateClientDto: UpdateClientDto) {
    if (Number.isNaN(telegramId)) {
      throw new BadRequestException('The Telegram ID does not match the numeric type');
    }

    const client = await this.clientModel
      .findOneAndUpdate({ telegramId }, updateClientDto, { new: true })
      .exec();

    if (!client) {
      throw new NotFoundException(`${telegramId} not found`);
    }

    return client;
  }

  async remove(telegramId: number) {
    if (Number.isNaN(telegramId)) {
      throw new BadRequestException('The Telegram ID does not match the numeric type');
    }

    const client = await this.clientModel.findOneAndDelete({ telegramId }, { new: true }).exec();

    if (!client) {
      throw new NotFoundException(`${telegramId} not found`);
    }

    await this.clientMessagesModel.deleteOne({ telegramId });
    await this.clientImagesModel.deleteOne({ telegramId });

    return client;
  }

  async availability(telegramId: number) {
    if (Number.isNaN(telegramId)) {
      throw new BadRequestException('The Telegram ID does not match the numeric type');
    }

    const client = await this.clientModel.findOne({ telegramId }).exec();

    if (!client) {
      throw new NotFoundException(`${telegramId} not found`);
    }

    return { rate: client.rate, state: client.state };
  }

  async changeState(changeStateClientDto: ChangeStateClientDto, role: AdminRoles) {
    const {
      blockReason = '',
      isApproved,
      isBlocked,
      telegramId,
      enableNotification = false,
    } = changeStateClientDto;

    const client = await this.clientModel.findOne({ telegramId }).exec();

    if (!client) {
      throw new NotFoundException(`${telegramId} not found`);
    }

    client.state = {
      blockReason,
      isApproved:
        isBoolean(isApproved) && role !== AdminRoles.MODERATOR
          ? isApproved
          : client.state.isApproved,
      isBlocked: isBoolean(isBlocked) ? isBlocked : client.state.isBlocked,
      updatedAt: getTimestampUnix(),
    };

    await client.save();

    if (isApproved && enableNotification) {
      const lang = getAvailableLocale(client.languageCode);

      const message = this.i18n.t('locale.client.auth-approved', {
        args: { ttl: fromMsToMins(this.configService.get('cache.ttl')) },
        lang,
      });

      await this.telegramService.sendMessageToChat(telegramId, message, {});
    }

    return client.state;
  }

  async updateClientMessages(
    telegramId: number,
    messageId: number,
    messages: ChatCompletionMessage[],
  ) {
    const clientMessages = await this.clientMessagesModel.findOne({ telegramId }).exec();

    if (!clientMessages) {
      throw new NotFoundException(`GPT messages for ${telegramId} not found`);
    }

    clientMessages.messages = [
      ...clientMessages.messages,
      {
        createdAt: getTimestampUnix(),
        updatedAt: getTimestampUnix(),
        feedback: ClientFeedback.NONE,
        messageId,
        messages,
      },
    ];

    await clientMessages.save();

    return clientMessages;
  }

  async updateClientImages(
    telegramId: number,
    messageId: number,
    images: { urls: string[]; prompt: string; revisedPrompt: string },
  ) {
    const { urls, prompt, revisedPrompt } = images;

    const clientImages = await this.clientImagesModel.findOne({ telegramId }).exec();

    if (!clientImages) {
      throw new NotFoundException(`GPT images for ${telegramId} not found`);
    }

    clientImages.images = [
      ...clientImages.images,
      {
        createdAt: getTimestampUnix(),
        feedback: ClientFeedback.NONE,
        messageId,
        prompt,
        revisedPrompt,
        updatedAt: getTimestampUnix(),
        urls,
      },
    ];

    await clientImages.save();

    return clientImages;
  }

  async updateClientRate(
    telegramId: number,
    { usedTokens = 0, usedImages = 0 }: { usedTokens?: number; usedImages?: number },
  ) {
    const client = await this.clientModel.findOne({ telegramId }).exec();

    if (!client) {
      throw new NotFoundException(`${telegramId} not found`);
    }

    const isPremiumClient = client.rate.name === ClientNamesRate.PREMIUM;

    if (isExpiredDate(client.rate.expiresAt)) {
      client.rate = {
        ...client.rate,
        name: client.rate.name === ClientNamesRate.PROMO ? ClientNamesRate.BASE : client.rate.name,
        expiresAt: getTimestampPlusDays(MONTH_IN_DAYS),
        gptTokens: Math.max(
          isPremiumClient ? ClientTokensRate.PREMIUM : ClientTokensRate.BASE - usedTokens,
          0,
        ),
        images: Math.max(
          isPremiumClient ? ClientImagesRate.PREMIUM : ClientImagesRate.BASE - usedImages,
          0,
        ),
      };
    } else {
      client.rate = {
        ...client.rate,
        gptTokens: Math.max(client.rate.gptTokens - usedTokens, 0),
        images: Math.max(client.rate.images - usedImages, 0),
      };
    }

    await client.save();

    return client.rate;
  }

  async updateClientRateName(updateClientRateNameDto: UpdateClientRateNameDto) {
    const { telegramId, name } = updateClientRateNameDto;

    const client = await this.clientModel.findOne({ telegramId }).exec();

    if (!client) {
      throw new NotFoundException(`${telegramId} not found`);
    }

    if (client.rate.name === name) {
      return client.rate;
    }

    await this.cacheManager.del(GET_GPT_MODELS_CACHE_KEY);

    const clientRate = (() => {
      if (name === ClientNamesRate.PREMIUM) {
        return {
          images: ClientImagesRate.PREMIUM,
          gptModels: gptModelsPremium,
          gptTokens: ClientTokensRate.PREMIUM,
          symbol: ClientSymbolRate.PREMIUM,
        };
      }

      if (name === ClientNamesRate.PROMO) {
        return {
          images: ClientImagesRate.PROMO,
          gptModels: gptModelsPromo,
          gptTokens: ClientTokensRate.PROMO,
          symbol: '',
        };
      }

      return {
        images: ClientImagesRate.BASE,
        gptModels: gptModelsBase,
        gptTokens: ClientTokensRate.BASE,
        symbol: '',
      };
    })();

    if (name === ClientNamesRate.PROMO) {
      client.rate = {
        ...clientRate,
        expiresAt: getTimestampPlusDays(),
        name,
      };
    } else {
      const expiresIn = expiresInMs(client.rate.expiresAt);
      const remainDays = differenceInCalendarDays(new Date(), expiresIn) || MONTH_IN_DAYS;

      const remainTokens = Math.floor((clientRate.gptTokens / MONTH_IN_DAYS) * remainDays);
      const remainImages = Math.floor((clientRate.images / MONTH_IN_DAYS) * remainDays);

      client.rate = {
        ...client.rate,
        gptModels: clientRate.gptModels,
        gptTokens: remainTokens,
        images: remainImages,
        name,
        symbol: clientRate.symbol,
      };
    }

    await client.save();

    return client.rate;
  }

  async setClientFeedback(feedbackClientDto: FeedbackClientDto) {
    const { telegramId, messageId, feedback } = feedbackClientDto;

    const clientMessages = await this.clientMessagesModel.findOne({ telegramId }).exec();
    const clientImages = await this.clientImagesModel.findOne({ telegramId }).exec();

    if (!clientMessages && !clientImages) {
      throw new NotFoundException(`GPT messages and images for ${telegramId} not found`);
    }

    const messagesIndex = clientMessages.messages.findIndex(
      (message) => message.messageId === messageId,
    );
    const imagesIndex = clientImages.images.findIndex((image) => image.messageId === messageId);

    if (messagesIndex > -1) {
      const messagesCopy = copyObject(clientMessages.messages[messagesIndex]);

      messagesCopy.feedback = feedback;
      messagesCopy.updatedAt = getTimestampUnix();

      clientMessages.messages = [
        ...clientMessages.messages.filter(
          (message) => message.messageId !== messagesCopy.messageId,
        ),
        messagesCopy,
      ];

      await clientMessages.save();
    }

    if (imagesIndex > -1) {
      const imagesCopy = copyObject(clientImages.images[imagesIndex]);

      imagesCopy.feedback = feedback;
      imagesCopy.updatedAt = getTimestampUnix();

      clientImages.images = [
        ...clientImages.images.filter((image) => image.messageId !== imagesCopy.messageId),
        imagesCopy,
      ];

      await clientImages.save();
    }

    return {
      messages: clientMessages.messages[messagesIndex] ?? [],
      images: clientImages.images[imagesIndex] ?? [],
    };
  }

  async clientsMailing(clientsMailingDto: ClientsMailingDto) {
    const { telegramIds, message } = clientsMailingDto;

    const clients = await this.clientModel.find({ telegramId: { $in: telegramIds } }).exec();

    for (const client of clients) {
      const { telegramId, languageCode } = client;

      const lang = getAvailableLocale(languageCode);
      const translate = await getTranslation(message, lang);

      const text = `${translate.text}\n\r\n\r<b>${this.i18n.t('locale.client.translated-by', {
        lang,
      })} <a href="${translate.provider.url}">${translate.provider.name}</a></b>`;

      await this.telegramService.sendMessageToChat(telegramId, text, {
        parsedMode: 'HTML',
      });
    }

    return {
      result: 'ok',
      sentToClients: clients.map(({ telegramId }) => telegramId),
      status: HttpStatusCode.Ok,
    };
  }
}
