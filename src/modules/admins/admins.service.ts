import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { getTimestamp } from 'src/common/utils';

import { BanAdminDto } from './dto/ban-admin.dto';
import { ChangeRoleAdminDto } from './dto/change-role-admin.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Admin } from './schemas';

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

  async changeRole(addRoleAdminDto: ChangeRoleAdminDto) {
    const { adminId, role } = addRoleAdminDto;

    return this.adminModel.findOneAndUpdate({ admin_id: adminId }, { role }, { new: true });
  }

  async block(banAdminDto: BanAdminDto) {
    const { adminId, banReason } = banAdminDto;

    return this.adminModel.findOneAndUpdate(
      { admin_id: adminId },
      { state: { ban_reason: banReason, updated_at: getTimestamp(), is_banned: true } },
      { new: true },
    );
  }

  async unblock(adminId: string) {
    return this.adminModel.findOneAndUpdate(
      { admin_id: adminId },
      { state: { ban_reason: '', updated_at: getTimestamp(), is_banned: false } },
      { new: true },
    );
  }
}
