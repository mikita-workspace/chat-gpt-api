import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { getTimestampUnix, isBoolean } from 'src/common/utils';
import { v4 as uuidv4 } from 'uuid';

import { AdminRoles } from '../admins/constants';
import { ChangeStateClientDto } from './dto/change-state-client.dto';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './schemas';
import { ClientImages } from './schemas/client-images.schema';
import { ClientMessages } from './schemas/client-messages.schema';

@Injectable()
export class ClientsService {
  constructor(
    @InjectModel(Client.name) private readonly clientModel: Model<Client>,
    @InjectModel(ClientMessages.name) private readonly clientMessagesModel: Model<ClientMessages>,
    @InjectModel(ClientImages.name) private readonly clientImagesModel: Model<ClientImages>,
  ) {}

  async create(createClientDto: CreateClientDto): Promise<Partial<Client>> {
    const { telegramId: telegram_id, username } = createClientDto;

    const client = await this.clientModel.findOne({ telegram_id }).exec();

    if (client) {
      throw new ConflictException(`${telegram_id} already exist`);
    }

    const newClientMessages = await this.clientMessagesModel.create({
      telegram_id,
      client_messages_id: uuidv4(),
    });

    const newClientImages = await this.clientImagesModel.create({
      telegram_id,
      client_images_id: uuidv4(),
    });

    const newClient = new this.clientModel({ telegram_id, username });

    newClient.set('gpt_messages', newClientMessages._id);
    newClient.set('dalle_images', newClientImages._id);

    await newClient.save();

    return {
      created_at: newClient.created_at,
      telegram_id: newClient.telegram_id,
      username: newClient.username,
    };
  }

  async findAll(role: `${AdminRoles}`): Promise<Client[]> {
    const filter = role === AdminRoles.MODERATOR ? { state: { is_approved: true } } : {};

    return this.clientModel.find(filter).exec();
  }

  async findOne(telegramId: number): Promise<Client> {
    if (Number.isNaN(telegramId)) {
      throw new BadRequestException('The Telegram ID does not match the numeric type');
    }

    const client = await this.clientModel.findOne({ telegram_id: telegramId }).exec();

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
      .findOneAndUpdate({ telegram_id: telegramId }, updateClientDto, { new: true })
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

    const client = await this.clientModel
      .findOneAndDelete({ telegram_id: telegramId }, { new: true })
      .exec();

    if (!client) {
      throw new NotFoundException(`${telegramId} not found`);
    }

    await this.clientMessagesModel.deleteOne({ telegram_id: telegramId });
    await this.clientImagesModel.deleteOne({ telegram_id: telegramId });

    return client;
  }

  async availability(telegramId: number) {
    if (Number.isNaN(telegramId)) {
      throw new BadRequestException('The Telegram ID does not match the numeric type');
    }

    const client = await this.clientModel.findOne({ telegram_id: telegramId }).exec();

    if (!client) {
      throw new NotFoundException(`${telegramId} not found`);
    }

    return client.state;
  }

  async changeState(changeStateClientDto: ChangeStateClientDto) {
    const {
      blockReason = '',
      isApproved: is_approved,
      isBlocked: is_blocked,
      telegramId: telegram_id,
    } = changeStateClientDto;

    if (Number.isNaN(telegram_id)) {
      throw new BadRequestException('The Telegram ID does not match the numeric type');
    }

    const client = await this.clientModel.findOne({ telegram_id }).exec();

    if (!client) {
      throw new NotFoundException(`${telegram_id} not found`);
    }

    client.state = {
      block_reason: is_blocked ? blockReason : '',
      is_approved: isBoolean(is_approved) ? is_approved : client.state.is_approved,
      is_blocked: isBoolean(is_blocked) ? is_blocked : client.state.is_blocked,
      updated_at: getTimestampUnix(),
    };

    await client.save();

    return client.state;
  }
}
