import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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
    const { email } = createAdminDto;

    const admin = await this.adminModel.findOne({ email });

    if (admin) {
      throw new ConflictException(`${admin.admin_id} already exist`);
    }

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
    const admin = await this.adminModel.findOne({ admin_id: adminId }).exec();

    if (!admin) {
      throw new NotFoundException(`${adminId} not found`);
    }

    return admin;
  }

  async findOneByEmail(email: string): Promise<Admin> {
    const admin = await this.adminModel.findOne({ email }).exec();

    if (!admin) {
      throw new NotFoundException(`${email} not found`);
    }

    return admin;
  }

  async update(adminId: string, updateAdminDto: UpdateAdminDto): Promise<Admin> {
    const admin = await this.adminModel
      .findOneAndUpdate({ admin_id: adminId }, updateAdminDto, { new: true })
      .exec();

    if (!admin) {
      throw new NotFoundException(`${adminId} not found`);
    }

    return admin;
  }

  async remove(adminId: string) {
    const admin = await this.adminModel
      .findOneAndDelete({ admin_id: adminId }, { new: true })
      .exec();

    if (!admin) {
      throw new NotFoundException(`${adminId} not found`);
    }

    return admin;
  }

  async changeRole(addRoleAdminDto: ChangeRoleAdminDto) {
    const { adminId, role } = addRoleAdminDto;

    const admin = await this.adminModel.findOneAndUpdate(
      { admin_id: adminId },
      { role },
      { new: true },
    );

    if (!admin) {
      throw new NotFoundException(`${adminId} not found`);
    }

    return admin;
  }

  async block(banAdminDto: BanAdminDto) {
    const { adminId, banReason } = banAdminDto;

    const admin = await this.adminModel.findOneAndUpdate(
      { admin_id: adminId },
      { state: { ban_reason: banReason, updated_at: getTimestamp(), is_banned: true } },
      { new: true },
    );

    if (!admin) {
      throw new NotFoundException(`${adminId} not found`);
    }

    return admin;
  }

  async unblock(adminId: string) {
    const admin = await this.adminModel.findOneAndUpdate(
      { admin_id: adminId },
      { state: { ban_reason: '', updated_at: getTimestamp(), is_banned: false } },
      { new: true },
    );

    if (!admin) {
      throw new NotFoundException(`${adminId} not found`);
    }

    return admin;
  }
}
