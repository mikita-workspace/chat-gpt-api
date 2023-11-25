import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@/database';

import { CSM } from './constants';
import { CreateCsmDto } from './dto/create-csm.dto';

@Injectable()
export class CsmService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createCsmDto: CreateCsmDto) {
    const { telegramId, description, key } = createCsmDto;

    const lastCsm = await this.prismaService.csm.findMany({
      orderBy: {
        id: 'desc',
      },
      take: 1,
    });

    const lastTicketNumber = Number(lastCsm[0]?.ticketNumber?.split('-')[1]);
    const ticketNumber = `${CSM}-${Number.isFinite(lastTicketNumber) ? lastTicketNumber + 1 : 1}`;

    const newCsm = await this.prismaService.csm.create({
      data: {
        description,
        ticketNumber,
        telegramId,
        topic: { connect: { key } },
      },
      select: { ticketNumber: true, status: true, description: true },
    });

    // TODO: Slack service here
    // const [slackMessage, slackBlocks] = [
    //   `${newClient.metadata.firstname}${
    //     newClient.metadata?.lastname ? ` ${newClient.metadata?.lastname}` : ''
    //   } is awaiting approval`,
    //   newClientPayload(newClient),
    // ];

    // await this.slackService.sendCustomMessage(slackMessage, slackBlocks, ChannelId.NEW_CLIENTS);

    return newCsm;
  }

  async findAll<T extends Prisma.CsmFindFirstArgs>(args?: T) {
    return await this.prismaService.csm.findMany(args);
  }

  async findOne<T extends Prisma.CsmFindFirstArgs['select']>(ticketNumber: string, select?: T) {
    const csmTopic = await this.prismaService.csm.findFirst({ where: { ticketNumber }, select });

    if (!csmTopic) {
      throw new NotFoundException(`${ticketNumber} not found`);
    }

    return csmTopic;
  }

  async update<T extends Prisma.CsmUpdateArgs['data'], K extends Prisma.CsmUpdateArgs['select']>(
    ticketNumber: string,
    data: T,
    select?: K,
  ) {
    const csmTopic = await this.prismaService.csm.update({
      where: { ticketNumber },
      data,
      select,
    });

    if (!csmTopic) {
      throw new NotFoundException(`${ticketNumber} not found`);
    }

    return csmTopic;
  }

  async remove(ticketNumber: string) {
    return await this.prismaService.csm.delete({ where: { ticketNumber } });
  }
}
