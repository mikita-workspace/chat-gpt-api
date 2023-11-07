import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client } from './schemas';

@Injectable()
export class ClientsService {
  constructor(@InjectModel(Client.name) private readonly clientModel: Model<Client>) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    return new this.clientModel(createClientDto).save();
  }

  async findAll(): Promise<Client[]> {
    return this.clientModel.find().exec();
  }

  findOne(clientId: string): Promise<Client> {
    return this.clientModel.findOne({ client_id: clientId }).exec();
  }

  async findOneByTelegramId(telegramId: number): Promise<Client> {
    return this.clientModel.findOne({ telegram_id: telegramId }).exec();
  }

  update(clientId: string, updateClientDto: UpdateClientDto) {
    return this.clientModel
      .findOneAndUpdate({ client_id: clientId }, updateClientDto, { new: true })
      .exec();
  }

  remove(clientId: number) {
    return this.clientModel.deleteOne({ client_id: clientId });
  }
}
