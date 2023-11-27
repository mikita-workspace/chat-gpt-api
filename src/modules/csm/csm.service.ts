import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@/database';

import { ClientsService } from '../clients/clients.service';
import { ChannelId } from '../slack/constants';
import { newCsmPayload } from '../slack/payloads';
import { SlackService } from '../slack/slack.service';
import { CSM } from './constants';
import { CreateCsmDto } from './dto/create-csm.dto';

@Injectable()
export class CsmService {
  constructor(
    private readonly clientService: ClientsService,
    private readonly prismaService: PrismaService,
    private readonly slackService: SlackService,
  ) {}

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
      include: { topic: true },
    });

    const client = await this.prismaService.client.findFirst({
      where: { telegramId },
      select: { metadata: true },
    });

    const [slackMessage, slackBlocks] = [
      'A new CSM issue has been created',
      newCsmPayload(newCsm, newCsm.topic, client?.metadata),
    ];

    await this.slackService.sendCustomMessage(slackMessage, slackBlocks, ChannelId.CSM_ISSUES);

    return { ticketNumber: newCsm.ticketNumber, status: newCsm.status };
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
