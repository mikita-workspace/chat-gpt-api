import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import { AdminRoles } from '../admins/constants';
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

  async create(createClientDto: CreateClientDto): Promise<Client> {
    const { telegramId: telegram_id } = createClientDto;

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

    const newClient = new this.clientModel({ telegram_id });

    newClient.set('gpt_messages', newClientMessages._id);
    newClient.set('dalle_images', newClientImages._id);

    await newClient.save();

    return newClient;
  }

  async findAll(role: `${AdminRoles}`): Promise<Client[]> {
    const filter = role === AdminRoles.MODERATOR ? { state: { is_approved: true } } : {};

    return this.clientModel.find(filter).exec();
  }

  async findOne(telegramId: number): Promise<Client> {
    if (Number.isNaN(telegramId)) {
      throw new NotFoundException(`telegramId is not Number`);
    }

    const client = await this.clientModel.findOne({ telegram_id: telegramId }).exec();

    if (!client) {
      throw new NotFoundException(`${telegramId} not found`);
    }

    return client;
  }

  async update(telegramId: number, updateClientDto: UpdateClientDto) {
    if (Number.isNaN(telegramId)) {
      throw new NotFoundException(`telegramId is not Number`);
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
      throw new NotFoundException(`telegramId is not Number`);
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
}
