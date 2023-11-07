import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AdminRoles } from '../admins/constants';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './schemas';

@Injectable()
export class ClientsService {
  constructor(@InjectModel(Client.name) private readonly clientModel: Model<Client>) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    const { telegramId: telegram_id } = createClientDto;

    const client = await this.clientModel.findOne({ telegram_id }).exec();

    if (client) {
      throw new ConflictException(`${telegram_id} already exist`);
    }

    return new this.clientModel({ telegram_id }).save();
  }

  async findAll(role: `${AdminRoles}`): Promise<Client[]> {
    // TODO: Filtered clients for moderator (only approved users)
    console.log(role);
    return this.clientModel.find().exec();
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

    return client;
  }
}
