import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@/database';

import { CreateCsmTopicDto } from './dto/create-csm-topic.dto';

@Injectable()
export class CsmTopicService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createCsmTopicDto: CreateCsmTopicDto) {
    const { isPrivate, key, name } = createCsmTopicDto;

    const existingCsmTopic = await this.prismaService.csmTopic.findFirst({
      where: { key },
      select: { key: true },
    });

    if (existingCsmTopic) {
      throw new ConflictException(`${existingCsmTopic.key} already exist`);
    }

    return await this.prismaService.csmTopic.create({
      data: { isPrivate, key, name },
    });
  }

  async findAll<T extends Prisma.CsmTopicFindFirstArgs>(args?: T) {
    return await this.prismaService.csmTopic.findMany(args);
  }

  async findOne<T extends Prisma.CsmTopicFindFirstArgs['select']>(key: string, select?: T) {
    const csmTopic = await this.prismaService.csmTopic.findFirst({ where: { key }, select });

    if (!csmTopic) {
      throw new NotFoundException(`${key} not found`);
    }

    return csmTopic;
  }

  async update<
    T extends Prisma.CsmTopicUpdateArgs['data'],
    K extends Prisma.CsmTopicUpdateArgs['select'],
  >(key: string, data: T, select?: K) {
    const csmTopic = await this.prismaService.csmTopic.update({
      where: { key },
      data,
      select,
    });

    if (!csmTopic) {
      throw new NotFoundException(`${key} not found`);
    }

    return csmTopic;
  }

  async remove(key: string) {
    return await this.prismaService.csmTopic.delete({ where: { key } });
  }
}
