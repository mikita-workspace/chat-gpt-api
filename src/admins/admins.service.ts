import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Admin } from './schemas/admin.schema';

@Injectable()
export class AdminsService {
  constructor(@InjectModel(Admin.name) private readonly adminModel: Model<Admin>) {}

  async create(createAdminDto: CreateAdminDto): Promise<Admin> {
    return new this.adminModel(createAdminDto).save();
  }

  async findAll(): Promise<Admin[]> {
    return this.adminModel.find().exec();
  }

  async findOne(adminId: string): Promise<Admin> {
    return this.adminModel.findOne({ adminId }, { new: true });
  }

  async findOneByEmail(email: string): Promise<Admin> {
    return this.adminModel.findOne({ email }, { new: true });
  }

  async update(adminId: string, updateAdminDto: UpdateAdminDto): Promise<Admin> {
    return this.adminModel.findOneAndUpdate({ adminId }, { ...updateAdminDto }, { new: true });
  }

  async remove(adminId: string) {
    return this.adminModel.deleteOne({ adminId }, { new: true });
  }
}
