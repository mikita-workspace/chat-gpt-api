import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatPostMessageArguments, ErrorCode, WebClient } from '@slack/web-api';

@Injectable()
export class SlackService {
  private slackClient: WebClient;

  constructor(private readonly configService: ConfigService) {
    this.slackClient = new WebClient(configService.get('slack.token'));
  }

  async sendMessage(text: string, channel: string) {
    try {
      const data = await this.slackClient.chat.postMessage({
        channel,
        text,
      });

      return data;
    } catch (error) {
      if (error.code === ErrorCode.PlatformError) {
        throw new BadRequestException(error.message);
      }
    }
  }

  async sendCustomMessage(
    text: string,
    blocks: ChatPostMessageArguments['blocks'],
    channelId: string,
  ) {
    try {
      const data = await this.slackClient.chat.postMessage({
        text,
        channel: channelId,
        blocks,
      });

      return data;
    } catch (error) {
      if (error.code === ErrorCode.PlatformError) {
        throw new BadRequestException(error.message);
      }
    }
  }
}
