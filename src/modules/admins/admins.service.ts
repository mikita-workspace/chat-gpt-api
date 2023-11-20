import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { FilterQuery, Model } from 'mongoose';

import { getTimestampUnix } from '@/common/utils';

import { ChangeRoleAdminDto } from './dto/change-role-admin.dto';
import { ChangeStateAdminDto } from './dto/change-state-admin.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Admin } from './schemas';

@Injectable()
export class AdminsService {
  constructor(@InjectModel(Admin.name) private readonly adminModel: Model<Admin>) {}

  async create(createAdminDto: CreateAdminDto): Promise<Admin> {
    const { email } = createAdminDto;

    const admin = await this.adminModel.findOne({ email }).exec();

    if (admin) {
      throw new ConflictException(`${admin.adminId} already exist`);
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createAdminDto.password, salt);

    return new this.adminModel({
      ...createAdminDto,
      password: hashedPassword,
    }).save();
  }

  async findAll(filter: FilterQuery<Admin>, projection: string | null = null) {
    return this.adminModel.find(filter, projection).exec();
  }

  async findOne(adminId: string, projection: string | null = null) {
    const admin = await this.adminModel.findOne({ adminId }, projection).exec();

    if (!admin) {
      throw new NotFoundException(`${adminId} not found`);
    }

    return admin;
  }

  async findOneByEmail(email: string, projection: string | null = null): Promise<Admin> {
    const admin = await this.adminModel.findOne({ email }, projection).exec();

    if (!admin) {
      throw new NotFoundException(`${email} not found`);
    }

    return admin;
  }

  async update(adminId: string, updateAdminDto: UpdateAdminDto): Promise<Admin> {
    const admin = await this.adminModel
      .findOneAndUpdate({ adminId }, updateAdminDto, { new: true })
      .exec();

    if (!admin) {
      throw new NotFoundException(`${adminId} not found`);
    }

    return admin;
  }

  async remove(adminId: string) {
    const admin = await this.adminModel.findOneAndDelete({ adminId }, { new: true }).exec();

    if (!admin) {
      throw new NotFoundException(`${adminId} not found`);
    }

    return admin;
  }

  async changeRole(changeRoleAdminDto: ChangeRoleAdminDto) {
    const { adminId, role } = changeRoleAdminDto;

    const admin = await this.findOne(adminId, 'role');

    admin.role = role;

    await admin.save();

    return admin;
  }

  async changeState(changeStateAdminDto: ChangeStateAdminDto) {
    const { adminId, blockReason = '', isBlocked } = changeStateAdminDto;

    const admin = await this.findOne(adminId, 'state');

    admin.state = {
      ...admin.state,
      blockReason,
      isBlocked,
      updatedAt: getTimestampUnix(),
    };

    await admin.save();

    return admin.state;
  }
}
