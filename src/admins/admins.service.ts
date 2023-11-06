import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { getTimestamp } from 'src/common/utils';

import { AddRoleAdminDto } from './dto/add-role-admin.dto';
import { BanAdminDto } from './dto/ban-admin.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Admin } from './schemas/admin.schema';

@Injectable()
export class AdminsService {
  constructor(@InjectModel(Admin.name) private readonly adminModel: Model<Admin>) {}

  async create(createAdminDto: CreateAdminDto): Promise<Admin> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createAdminDto.password, salt);

    return new this.adminModel({
      ...createAdminDto,
      password: hashedPassword,
    }).save();
  }

  async findAll(): Promise<Admin[]> {
    return this.adminModel.find().exec();
  }

  async findOne(adminId: string): Promise<Admin> {
    return this.adminModel.findOne({ admin_id: adminId }).exec();
  }

  async findOneByEmail(email: string): Promise<Admin> {
    return this.adminModel.findOne({ email }).exec();
  }

  async update(adminId: string, updateAdminDto: UpdateAdminDto): Promise<Admin> {
    return this.adminModel
      .findOneAndUpdate({ admin_id: adminId }, { ...updateAdminDto }, { new: true })
      .exec();
  }

  async remove(adminId: string) {
    return this.adminModel.deleteOne({ admin_id: adminId });
  }

  async addRole(addRoleAdminDto: AddRoleAdminDto) {
    const { adminId, role } = addRoleAdminDto;

    return this.adminModel.findOneAndUpdate({ admin_id: adminId }, { role }, { new: true });
  }

  async ban(banAdminDto: BanAdminDto) {
    const { adminId, banReason } = banAdminDto;

    return this.adminModel.findOneAndUpdate(
      { admin_id: adminId },
      { ban_reason: banReason, banned_at: getTimestamp() },
      { new: true },
    );
  }
}
