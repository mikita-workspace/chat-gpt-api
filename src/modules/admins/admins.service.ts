import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { getTimestampUtc } from '@/common/utils';
import { PrismaService } from '@/database';

import { ChangeRoleAdminDto } from './dto/change-role-admin.dto';
import { ChangeStateAdminDto } from './dto/change-state-admin.dto';
import { CreateAdminDto } from './dto/create-admin.dto';

@Injectable()
export class AdminsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createAdminDto: CreateAdminDto) {
    const { email } = createAdminDto;

    const existingAdmin = await this.prismaService.admin.findFirst({
      where: { email },
      select: { email: true },
    });

    if (existingAdmin) {
      throw new ConflictException(`${existingAdmin.email} already exist`);
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createAdminDto.password, salt);

    return await this.prismaService.admin.create({
      data: {
        ...createAdminDto,
        password: hashedPassword,
        state: { blockReason: '', isBlocked: false, updatedAt: getTimestampUtc() },
      },
    });
  }

  async findAll<T extends Prisma.AdminFindManyArgs>(args?: T) {
    return await this.prismaService.admin.findMany(args);
  }

  async findOne<T extends Prisma.AdminFindFirstArgs['select']>(email: string, select?: T) {
    const admin = await this.prismaService.admin.findFirst({ where: { email }, select });

    if (!admin) {
      throw new NotFoundException(`${email} not found`);
    }

    return admin;
  }

  async update<
    T extends Prisma.AdminUpdateArgs['data'],
    K extends Prisma.AdminUpdateArgs['select'],
  >(email: string, data: T, select?: K) {
    const admin = await this.prismaService.admin.update({ where: { email }, data, select });

    if (!admin) {
      throw new NotFoundException(`${email} not found`);
    }

    return admin;
  }

  async remove(email: string) {
    return await this.prismaService.admin.delete({ where: { email } });
  }

  async changeRole(changeRoleAdminDto: ChangeRoleAdminDto) {
    const { email, role } = changeRoleAdminDto;

    return await this.update(email, { role }, { role: true });
  }

  async changeState(changeStateAdminDto: ChangeStateAdminDto) {
    const { email, blockReason = '', isBlocked } = changeStateAdminDto;

    const existingAdmin = await this.findOne(email, { state: true });

    return await this.update(
      email,
      {
        state: {
          set: { ...existingAdmin.state, blockReason, isBlocked, updatedAt: getTimestampUtc() },
        },
      },
      { state: true },
    );
  }
}
