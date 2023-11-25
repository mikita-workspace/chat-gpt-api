import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { HttpStatusCode } from 'axios';
import { Cache as CacheManager } from 'cache-manager';
import { differenceInCalendarDays } from 'date-fns';
import { I18nService } from 'nestjs-i18n';
import { ChatCompletionMessage } from 'openai/resources/chat';

import { MONTH_IN_DAYS } from '@/common/constants';
import {
  expiresInFormat,
  expiresInMs,
  getAvailableLocale,
  getMessageByAvailableLocale,
  getTimestampPlusDays,
  getTimestampPlusMilliseconds,
  getTimestampUtc,
  isBoolean,
  isExpiredDate,
} from '@/common/utils';
import { PrismaService } from '@/database';

import { AdminRole } from '../admins/constants';
import { GET_GPT_MODELS_CACHE_KEY, gptModelsBase } from '../gpt/constants';
import { ChannelId } from '../slack/constants';
import { newClientPayload } from '../slack/payloads';
import { SlackService } from '../slack/slack.service';
import { TelegramService } from '../telegram/telegram.service';
import { ClientFeedback, ClientImageLevel, ClientNameLevel, ClientTokenLevel } from './constants';
import { ChangeStateClientDto } from './dto/change-state-client.dto';
import { CreateClientDto } from './dto/create-client.dto';
import { FeedbackClientDto } from './dto/feedback-client.dto';
import { ClientsMailingDto } from './dto/mailing-clients.dto';
import { UpdateClientAccountLevelNameDto } from './dto/update-client-account-level-name.dto';
import { UpdateClientMetadataDto } from './dto/update-metadata-client.dto';
import {
  getClientAccountLevel,
  getClientUpdatedImageFeedback,
  getClientUpdatedMessageFeedback,
} from './helpers';

@Injectable()
export class ClientsService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: CacheManager,
    private readonly configService: ConfigService,
    private readonly i18n: I18nService,
    private readonly prismaService: PrismaService,
    private readonly slackService: SlackService,
    private readonly telegramService: TelegramService,
  ) {}

  async create(createClientDto: CreateClientDto) {
    const { telegramId, metadata } = createClientDto;

    const existingClient = await this.prismaService.client.findFirst({ where: { telegramId } });

    if (existingClient) {
      throw new ConflictException(`${telegramId} already exist`);
    }

    const newClient = await this.prismaService.client.create({
      data: {
        telegramId,
        metadata,
        messages: {
          create: {
            telegramId,
          },
        },
        images: {
          create: {
            telegramId,
          },
        },
        accountLevel: {
          expiresAt: getTimestampPlusDays(MONTH_IN_DAYS),
          gptModels: gptModelsBase,
          gptTokens: ClientTokenLevel.BASE,
          images: ClientImageLevel.BASE,
          name: ClientNameLevel.BASE,
          symbol: '',
        },
        state: {
          blockReason: '',
          isApproved: false,
          isBlocked: false,
          updatedAt: getTimestampUtc(),
        },
      },
    });

    const [slackMessage, slackBlocks] = [
      `${newClient.metadata.firstname}${
        newClient.metadata?.lastname ? ` ${newClient.metadata?.lastname}` : ''
      } is awaiting approval`,
      newClientPayload(newClient),
    ];

    await this.slackService.sendCustomMessage(slackMessage, slackBlocks, ChannelId.NEW_CLIENTS);

    return {
      createdAt: newClient.createdAt,
      metadata: newClient.metadata,
      telegramId: newClient.telegramId,
    };
  }

  async findAll<T extends Prisma.ClientFindManyArgs>(args?: T) {
    return await this.prismaService.client.findMany(args);
  }

  async findOne<T extends Prisma.ClientFindFirstArgs['select']>(telegramId: number, select?: T) {
    if (Number.isNaN(telegramId)) {
      throw new BadRequestException('The Telegram ID does not match the numeric type');
    }

    const client = await this.prismaService.client.findFirst({ where: { telegramId }, select });

    if (!client) {
      throw new NotFoundException(`${telegramId} not found`);
    }

    return client;
  }

  async update<
    T extends Prisma.ClientUpdateArgs['data'],
    K extends Prisma.ClientUpdateArgs['select'],
  >(telegramId: number, data: T, select?: K) {
    if (Number.isNaN(telegramId)) {
      throw new BadRequestException('The Telegram ID does not match the numeric type');
    }

    const client = await this.prismaService.client.update({
      where: { telegramId },
      data,
      select,
    });

    if (!client) {
      throw new NotFoundException(`${telegramId} not found`);
    }

    return client;
  }

  async remove(telegramId: number) {
    return await this.prismaService.client.delete({ where: { telegramId } });
  }

  async removeMultiple(telegramIds: number[]) {
    return await this.prismaService.client.deleteMany({
      where: { telegramId: { in: telegramIds } },
    });
  }

  async availability(telegramId: number) {
    const client = await this.findOne(telegramId, { accountLevel: true, state: true });

    return { accountLevel: client.accountLevel, state: client.state };
  }

  async changeState(changeStateClientDto: ChangeStateClientDto, role: AdminRole) {
    const {
      blockReason = '',
      isApproved,
      isBlocked,
      telegramId,
      enableNotification = false,
    } = changeStateClientDto;

    const existingClient = await this.findOne(telegramId, { state: true });

    const client = await this.update(
      telegramId,
      {
        state: {
          set: {
            blockReason,
            isApproved:
              isBoolean(isApproved) && role !== AdminRole.MODERATOR
                ? isApproved
                : existingClient.state.isApproved,
            isBlocked: isBoolean(isBlocked) ? isBlocked : existingClient.state.isBlocked,
            updatedAt: getTimestampUtc(),
          },
        },
      },
      { state: true, metadata: true },
    );

    if (enableNotification) {
      const lang = getAvailableLocale(client.metadata.languageCode);

      if (existingClient.state.isApproved !== isApproved && isApproved) {
        const expiresIn = expiresInFormat(
          getTimestampPlusMilliseconds(this.configService.get('cache.ttl')),
          lang,
        );

        const message = this.i18n.t('locale.client.auth-approved', {
          args: { expiresIn },
          lang,
        });

        await this.telegramService.sendMessageToChat(telegramId, message, {});
      }

      if (existingClient.state.isBlocked !== isBlocked && isBlocked) {
        const message = this.i18n.t('locale.client.auth-blocked', {
          args: { reason: blockReason },
          lang,
        });

        await this.telegramService.sendMessageToChat(telegramId, message, {});
      }
    }

    return client.state;
  }

  async updateClientMessages(
    telegramId: number,
    messageId: number,
    messages: ChatCompletionMessage[],
  ) {
    const existingMessages = await this.prismaService.clientMessages.findFirst({
      where: { telegramId },
      select: { messages: true },
    });

    if (!existingMessages) {
      throw new NotFoundException(`GPT messages for ${telegramId} not found`);
    }

    const clientMessages = await this.prismaService.clientMessages.update({
      where: { telegramId },
      data: {
        messages: {
          set: [
            ...existingMessages.messages,
            {
              createdAt: getTimestampUtc(),
              feedback: ClientFeedback.NONE,
              messageId,
              messages,
              updatedAt: getTimestampUtc(),
            },
          ],
        },
      },
      select: { messages: true },
    });

    return clientMessages;
  }

  async updateClientImages(
    telegramId: number,
    messageId: number,
    images: { urls: string[]; prompt: string; revisedPrompt: string },
  ) {
    const { urls, prompt, revisedPrompt } = images;

    const existingImages = await this.prismaService.clientImages.findFirst({
      where: { telegramId },
      select: { images: true },
    });

    if (!existingImages) {
      throw new NotFoundException(`GPT images for ${telegramId} not found`);
    }

    const clientImages = await this.prismaService.clientImages.update({
      where: { telegramId },
      data: {
        images: {
          set: [
            ...existingImages.images,
            {
              createdAt: getTimestampUtc(),
              feedback: ClientFeedback.NONE,
              messageId,
              prompt,
              revisedPrompt,
              updatedAt: getTimestampUtc(),
              urls,
            },
          ],
        },
      },
      select: { images: true },
    });

    return clientImages;
  }

  async updateClientAccountLevel(
    telegramId: number,
    { usedTokens = 0, usedImages = 0 }: { usedTokens?: number; usedImages?: number },
  ) {
    const existingClient = await this.findOne(telegramId, { accountLevel: true });

    const isPremiumClient = existingClient.accountLevel.name === ClientNameLevel.PREMIUM;

    if (isExpiredDate(existingClient.accountLevel.expiresAt)) {
      const client = await this.update(
        telegramId,
        {
          accountLevel: {
            set: {
              ...existingClient.accountLevel,
              name:
                existingClient.accountLevel.name === ClientNameLevel.PROMO
                  ? ClientNameLevel.BASE
                  : existingClient.accountLevel.name,
              expiresAt: getTimestampPlusDays(MONTH_IN_DAYS),
              gptModels:
                existingClient.accountLevel.name === ClientNameLevel.PROMO
                  ? gptModelsBase
                  : existingClient.accountLevel.gptModels,
              gptTokens: Math.max(
                isPremiumClient ? ClientTokenLevel.PREMIUM : ClientTokenLevel.BASE - usedTokens,
                0,
              ),
              images: Math.max(
                isPremiumClient ? ClientImageLevel.PREMIUM : ClientImageLevel.BASE - usedImages,
                0,
              ),
            },
          },
        },
        { accountLevel: true },
      );

      return client.accountLevel;
    }

    const client = await this.update(
      telegramId,
      {
        accountLevel: {
          set: {
            ...existingClient.accountLevel,
            gptTokens: Math.max(existingClient.accountLevel.gptTokens - usedTokens, 0),
            images: Math.max(existingClient.accountLevel.images - usedImages, 0),
          },
        },
      },
      { accountLevel: true },
    );

    return client.accountLevel;
  }

  async updateClientMetadata(updateClientMetadataDto: UpdateClientMetadataDto) {
    const { telegramId, metadata } = updateClientMetadataDto;

    const existingClient = await this.findOne(telegramId, { metadata: true });

    const client = await this.update(telegramId, {
      metadata: { set: { ...existingClient.metadata, ...metadata } },
    });

    return client.metadata;
  }

  async updateClientAccountLevelName(updateAccountLevelNameDto: UpdateClientAccountLevelNameDto) {
    const { telegramId, name } = updateAccountLevelNameDto;

    const existingClient = await this.findOne(telegramId, { accountLevel: true });

    if (existingClient.accountLevel.name === name) {
      return existingClient.accountLevel;
    }

    await this.cacheManager.del(`${GET_GPT_MODELS_CACHE_KEY}-${telegramId}`);

    const clientAccountLevel = getClientAccountLevel(name);

    if (name === ClientNameLevel.PROMO) {
      const client = await this.update(
        telegramId,
        {
          accountLevel: {
            set: {
              ...clientAccountLevel,
              expiresAt: getTimestampPlusDays(MONTH_IN_DAYS / 3),
              name,
            },
          },
        },
        { accountLevel: true },
      );

      return client.accountLevel;
    }

    const expiresIn = expiresInMs(existingClient.accountLevel.expiresAt);
    const remainDays = differenceInCalendarDays(new Date(), expiresIn) || MONTH_IN_DAYS;

    const remainTokens = Math.floor((clientAccountLevel.gptTokens / MONTH_IN_DAYS) * remainDays);
    const remainImages = Math.floor((clientAccountLevel.images / MONTH_IN_DAYS) * remainDays);

    const client = await this.update(
      telegramId,
      {
        accountLevel: {
          set: {
            ...existingClient.accountLevel,
            gptModels: clientAccountLevel.gptModels,
            gptTokens: remainTokens,
            images: remainImages,
            name,
            symbol: clientAccountLevel.symbol,
          },
        },
      },
      { accountLevel: true },
    );

    return client.accountLevel;
  }

  async setClientFeedback(feedbackClientDto: FeedbackClientDto) {
    const { telegramId, messageId, feedback } = feedbackClientDto;

    const existingClientMessages = await this.prismaService.clientMessages.findFirst({
      where: { telegramId },
    });
    const existingClientImages = await this.prismaService.clientImages.findFirst({
      where: { telegramId },
    });

    if (!existingClientMessages && !existingClientImages) {
      throw new NotFoundException(`GPT messages and images for ${telegramId} not found`);
    }

    const result = {
      message: null,
      image: null,
    };

    const updatedMessageFeedback = getClientUpdatedMessageFeedback(
      existingClientMessages,
      messageId,
      feedback,
    );

    const updatedImageFeedback = getClientUpdatedImageFeedback(
      existingClientImages,
      messageId,
      feedback,
    );

    if (updatedMessageFeedback) {
      const { messages, index } = updatedMessageFeedback;

      const clientMessages = await this.prismaService.clientMessages.update({
        where: { telegramId },
        data: {
          messages: {
            set: messages,
          },
        },
        select: { messages: true },
      });

      result.message = clientMessages.messages[index] || null;
    }

    if (updatedImageFeedback) {
      const { images, index } = updatedImageFeedback;

      const clientImages = await this.prismaService.clientImages.update({
        where: {
          telegramId,
        },
        data: {
          images: {
            set: images,
          },
        },
        select: { images: true },
      });

      result.image = clientImages.images[index] || null;
    }

    return result;
  }

  async clientsMailing(clientsMailingDto: ClientsMailingDto) {
    const { telegramIds, message } = clientsMailingDto;

    const clients = await this.findAll({
      where: telegramIds.length
        ? { telegramId: { in: telegramIds } }
        : { state: { is: { isApproved: true } } },
      select: { telegramId: true, metadata: true },
    });

    for (const client of clients) {
      const {
        telegramId,
        metadata: { languageCode },
      } = client;

      const clientLang = getAvailableLocale(languageCode);
      const text = getMessageByAvailableLocale(message, clientLang);

      await this.telegramService.sendMessageToChat(telegramId, text, {
        parsedMode: 'HTML',
        disableNotification: true,
      });
    }

    return {
      sentToClients: clients.map(({ telegramId }) => telegramId),
      status: HttpStatusCode.Ok,
    };
  }

  /**
   * @summary
   * Unauthorized clients will be deleted from DB every 24 hours
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCronRemoveClients() {
    const unauthorizedClients = await this.findAll({
      where: { state: { is: { isApproved: false } } },
      select: { telegramId: true },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (unauthorizedClients.length) {
      const ids = unauthorizedClients.map((client) => client.telegramId);

      await this.removeMultiple(ids);

      return ids;
    }

    return [];
  }
}
