import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { getTimestampUnix, isBoolean } from 'src/common/utils';
import { v4 as uuidv4 } from 'uuid';

import { AdminRoles } from '../admins/constants';
import { TelegramService } from '../telegram/telegram.service';
import { ChangeStateClientDto } from './dto/change-state-client.dto';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client, ClientImages, ClientMessages } from './schemas';

@Injectable()
export class ClientsService {
  constructor(
    @InjectModel(Client.name) private readonly clientModel: Model<Client>,
    @InjectModel(ClientMessages.name) private readonly clientMessagesModel: Model<ClientMessages>,
    @InjectModel(ClientImages.name) private readonly clientImagesModel: Model<ClientImages>,
    @Inject(TelegramService) private readonly telegramService: TelegramService,
    private readonly i18n: I18nService,
  ) {}

  async create(createClientDto: CreateClientDto): Promise<Partial<Client>> {
    const { telegramId, username, languageCode } = createClientDto;

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

    const newClient = new this.clientModel({ languageCode, telegramId, username });

    newClient.set('gptMessages', newClientMessages._id);
    newClient.set('dalleImages', newClientImages._id);

    await newClient.save();

    return {
      createdAt: newClient.createdAt,
      languageCode: newClient.languageCode,
      telegramId: newClient.telegramId,
      username: newClient.username,
    };
  }

  async findAll(role: `${AdminRoles}`): Promise<Client[]> {
    const filter = role === AdminRoles.MODERATOR ? { state: { isApproved: true } } : {};

    return this.clientModel.find(filter).exec();
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

    return client.state;
  }

  async changeState(changeStateClientDto: ChangeStateClientDto) {
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
      isApproved: isBoolean(isApproved) ? isApproved : client.state.isApproved,
      isBlocked: isBoolean(isBlocked) ? isBlocked : client.state.isBlocked,
      updatedAt: getTimestampUnix(),
    };

    await client.save();

    if (isApproved && enableNotification) {
      const message = this.i18n.t('locale.client.auth-approved', { lang: client.languageCode });

      await this.telegramService.sendTelegramMessage(telegramId, message);
    }

    return client.state;
  }
}
